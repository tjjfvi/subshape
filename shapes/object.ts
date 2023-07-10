import { AnyShape, createShape, Expand, Input, metadata, Output, Shape, ShapeVisitor, U2I } from "../common/mod.ts"
import { constant } from "./constant.ts"
import { option } from "./option.ts"

export function field<K extends keyof any, VI, VO>(key: K, $value: Shape<VI, VO>): Shape<
  Expand<Readonly<Record<K, VI>>>,
  Expand<Record<K, VO>>
> {
  return createShape({
    metadata: metadata("$.field", field, key, $value),
    staticSize: $value.staticSize,
    subEncode(buffer, value) {
      $value.subEncode(buffer, value[key])
    },
    subDecode(buffer) {
      return { [key]: $value.subDecode(buffer) } as any
    },
    subAssert(assert) {
      $value.subAssert(assert.key(this, key))
    },
  })
}

export function optionalField<K extends keyof any, VI, VO>(key: K, $value: Shape<VI, VO>): Shape<
  Expand<Readonly<Partial<Record<K, VI>>>>,
  Expand<Partial<Record<K, VO>>>
> {
  const $option = option($value)
  return createShape({
    metadata: metadata("$.optionalField", optionalField, key, $value),
    staticSize: $value.staticSize,
    subEncode(buffer, value) {
      $option.subEncode(buffer, value[key])
    },
    subDecode(buffer) {
      if (buffer.array[buffer.index++]) {
        return { [key]: $value.subDecode(buffer) } as any
      } else {
        return {}
      }
    },
    subAssert(assert) {
      assert.typeof(this, "object")
      assert.nonNull(this)
      if (key in (assert.value as any)) {
        $option.subAssert(assert.key(this, key))
      }
    },
  })
}

export type InputObject<T extends AnyShape[]> = Expand<
  U2I<
    | { x: {} }
    | {
      [K in keyof T]: { x: Input<T[K]> }
    }[number]
  >["x"]
>
export type OutputObject<T extends AnyShape[]> = Expand<
  U2I<
    | { x: {} }
    | {
      [K in keyof T]: { x: Output<T[K]> }
    }[number]
  >["x"]
>

type UnionKeys<T> = T extends T ? keyof T : never
export type ObjectMembers<T extends AnyShape[]> = [
  ...never extends T ? {
      [K in keyof T]: AnyShape extends T[K] ? AnyShape
        : 
          & UnionKeys<Input<T[K]>>
          & {
            [L in keyof T]: K extends L ? never : UnionKeys<Input<T[L]>>
          }[number] extends (infer O extends keyof any)
          ? [O] extends [never] ? Shape<Input<T[K]> & {}> : Shape<{ [_ in O]?: never }>
        : never
    }
    : T,
]

export function object<T extends AnyShape[]>(...members: ObjectMembers<T>): Shape<InputObject<T>, OutputObject<T>> {
  return createShape({
    metadata: metadata("$.object", object<T>, ...members),
    staticSize: members.map((x) => x.staticSize).reduce((a, b) => a + b, 0),
    subEncode: generateEncode(members as Shape<any>[]),
    subDecode: generateDecode(members as Shape<any>[]),
    subAssert(assert) {
      assert.typeof(this, "object")
      assert.nonNull(this)
      for (const member of members as T) {
        member.subAssert(assert)
      }
    },
  })
}

function generateEncode(members: Shape<any>[]) {
  const vars: string[] = []
  const args: unknown[] = []

  const valueVisitor = new ShapeVisitor<(v: string) => string>()
  valueVisitor.add(constant, (shape, value, pattern) => (v) => {
    if (pattern) {
      return `${addVar(shape)}.subEncode(buffer, ${v})`
    }
    return addVar(value)
  })
  valueVisitor.fallback((shape) => (v) => {
    return `${addVar(shape)}.subEncode(buffer, ${v})`
  })

  const fieldVisitor = new ShapeVisitor<string>()
  fieldVisitor.add(field, (_, key, value) => {
    return valueVisitor.visit(value)(`value[${typeof key === "symbol" ? addVar(key) : JSON.stringify(key)}]`)
  })
  fieldVisitor.add(optionalField, (_, key, value) => {
    return fieldVisitor.visit(field(key, option(value)))
  })
  fieldVisitor.add(object, (_, ...members) => {
    return members.map((x) => fieldVisitor.visit(x)).join(";")
  })
  fieldVisitor.fallback((shape) => {
    return `${addVar(shape)}.subEncode(buffer, value)`
  })

  const content = members.map((x) => fieldVisitor.visit(x)).join(";")

  return (new Function(...vars, `return function objectEncode(buffer,value){${content}}`))(...args)

  function addVar(value: unknown) {
    const v = "v" + vars.length
    vars.push(v)
    args.push(value)
    return v
  }
}

function generateDecode(members: Shape<any>[]) {
  const vars: string[] = []
  const args: unknown[] = []

  const valueVisitor = new ShapeVisitor<string>()
  valueVisitor.add(constant, (shape, value, pattern) => {
    if (pattern) {
      return `${addVar(shape)}.subDecode(buffer)`
    }
    return addVar(value)
  })
  valueVisitor.fallback((shape) => {
    return `${addVar(shape)}.subDecode(buffer)`
  })
  const fieldVisitor = new ShapeVisitor<string>()
  fieldVisitor.add(field, (_, key, value) => {
    return `[${typeof key === "symbol" ? addVar(key) : JSON.stringify(key)}]: ${valueVisitor.visit(value)}`
  })
  fieldVisitor.add(optionalField, (_, key, value) => {
    return `...buffer.array[buffer.index++] ? {${fieldVisitor.visit(field(key, value))} } : undefined`
  })
  fieldVisitor.add(object, (_, ...members) => {
    return members.map((x) => fieldVisitor.visit(x)).join(",")
  })
  fieldVisitor.fallback((shape) => {
    return `...${addVar(shape)}.subDecode(buffer)`
  })

  const content = members.map((x) => fieldVisitor.visit(x)).join(",")

  return (new Function(...vars, `return function objectDecode(buffer){return{${content}}}`))(...args)

  function addVar(value: unknown) {
    const v = "v" + vars.length
    vars.push(v)
    args.push(value)
    return v
  }
}
