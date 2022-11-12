export class EncodeBuffer {
  finishedArrays: (Uint8Array | EncodeBuffer)[] = []
  finishedSize = 0
  queuedArrays: Uint8Array[] = []
  array!: Uint8Array
  view!: DataView
  index = 0

  asyncCount = 0
  asyncPromise = Promise.resolve()
  asyncResolve: (value: void | Promise<void>) => void = () => {}

  /** Creates a new EncodeBuffer with a specified initial size/buffer */
  constructor(init: number | Uint8Array, public context = new Context()) {
    this._setArray(typeof init === "number" ? new Uint8Array(init) : init)
  }

  /**
   * Inserts a Uint8Array at the current position in the buffer.
   * This does not consume any of the pre-allocated space.
   */
  insertArray(buffer: Uint8Array) {
    this._commitWritten()
    this.finishedArrays.push(buffer)
    this.finishedSize += buffer.length
    if (this.index) {
      this._setArray(this.array.subarray(this.index))
    }
  }

  /**
   * Allocates more space in the EncodeBuffer.
   * `.popAlloc()` must be called after this space is used.
   */
  pushAlloc(size: number) {
    this._commitWritten()
    this.queuedArrays.push(this.array.subarray(this.index))
    this._setArray(new Uint8Array(size))
  }

  /**
   * Finishes the current array and resumes writing on the previous array.
   * Must be called after `.pushAlloc()`.
   */
  popAlloc() {
    this._commitWritten()
    this._setArray(this.queuedArrays.pop()!)
  }

  /**
   * Creates a sub-buffer that can be written into asynchronously.
   * The buffer passed to the callback should not be used after the returned promise resolves.
   */
  writeAsync(length: number, fn: (buffer: EncodeBuffer) => Promise<void>) {
    this.waitFor(async () => {
      const cursor = this.createCursor(length)
      await fn(cursor)
      cursor.close()
    })
  }

  /**
   * Creates a sub-buffer that can be written into later to insert data into the middle of the array.
   * `.close()` must be called after the cursor is done being written into.
   * The cursor should not be used after `.close()` is called.
   * If the cursor will be written into asynchronously, the buffer must be held open with `.waitFor()`.
   */
  createCursor(length: number): EncodeBuffer & { close(): void } {
    const cursor = Object.assign(
      new EncodeBuffer(this.stealAlloc(length), this.context),
      {
        close: () => {
          this.waitForBuffer(cursor, () => {
            cursor._commitWritten()
            this.finishedSize += cursor.finishedSize
          })
        },
      },
    )
    this.finishedArrays.push(cursor)

    return cursor
  }

  /**
   * Immediately invokes the callback, and holds the buffer open until the
   * returned promise resolves.
   */
  waitFor(fn: () => Promise<void>) {
    if (!this.asyncCount) {
      this.asyncPromise = new Promise((resolve) => this.asyncResolve = resolve)
    }
    this.asyncCount++

    fn()
      .then(() => {
        this.asyncCount--
        if (!this.asyncCount) {
          this.asyncResolve()
        }
      })
      .catch((e) => {
        this.asyncResolve(Promise.reject(e))
      })
  }

  /**
   * Consumes `length` allocated bytes without writing anything, and returns the skipped subarray.
   * Anything written into the returned array will not affect the buffer,
   * except if it is later reincorporated e.g. via `.insertArray()`.
   * Rather niche.
   */
  stealAlloc(length: number): Uint8Array {
    this._commitWritten()
    const array = this.array.subarray(this.index, this.index + length)
    this._setArray(this.array.subarray(this.index + length))
    return array
  }

  /**
   * Invokes the callback once buffer's async tasks finish, and holds this
   * buffer open until the callback returns.
   */
  waitForBuffer(buffer: EncodeBuffer, fn: () => void) {
    if (buffer.asyncCount) {
      this.waitFor(async () => {
        await buffer.asyncPromise
        fn()
      })
    } else {
      fn()
    }
  }

  /**
   * Finishes the current array, and returns a Uint8Array containing everything written.
   * The EncodeBuffer is left in an undefined state, and should not be used afterwards.
   * Throws if asynchronous writes are still pending.
   */
  finish(): Uint8Array {
    if (this.asyncCount) throw new Error("Attempted to finish before async completion")
    if (!this.finishedArrays.length) return this.array.subarray(0, this.index)
    this._commitWritten()
    const fullArray = new Uint8Array(this.finishedSize)
    this._finishInto(fullArray, 0)
    return fullArray
  }

  /**
   * Finishes the current array, and returns a Uint8Array containing everything written.
   * The EncodeBuffer is left in an undefined state, and should not be used afterwards.
   */
  async finishAsync(): Promise<Uint8Array> {
    await this.asyncPromise
    return this.finish()
  }

  /** Copies all data from finishedArrays into fullArray */
  _finishInto(fullArray: Uint8Array, index: number): number {
    for (let i = 0; i < this.finishedArrays.length; i++) {
      const array = this.finishedArrays[i]!
      if (array instanceof EncodeBuffer) {
        index = array._finishInto(fullArray, index)
      } else {
        fullArray.set(array, index)
        index += array.length
      }
    }
    return index
  }

  /**
   * Pushes the data written in array to finishedArrays.
   * Leaves the buffer in an invalid state -- array and index must be updated.
   */
  _commitWritten() {
    if (this.index) {
      this.finishedArrays.push(this.array.subarray(0, this.index))
      this.finishedSize += this.index
    }
  }

  /** Sets array and updates view */
  _setArray(array: Uint8Array) {
    this.array = array
    this.view = new DataView(array.buffer, array.byteOffset, array.byteLength)
    this.index = 0
  }
}

export class DecodeBuffer {
  view
  index = 0
  context = new Context()
  constructor(public array: Uint8Array) {
    this.view = new DataView(array.buffer, array.byteOffset, array.byteLength)
  }
}

export class Context {
  private map = new Map<new() => any, any>()
  get<T>(T: new() => T): T {
    let value = this.map.get(T)
    if (!value) {
      value = new T()
      this.map.set(T, value)
    }
    return value
  }
}
