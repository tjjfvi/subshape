export const visitFixtures = <D>(
  getFixtures: () => Map<Uint8Array, D>,
  visit: (
    bytes: Uint8Array,
    decoded: D,
    i: number,
  ) => void,
) => {
  let count = 0;
  for (const [bytes, decoded] of getFixtures().entries()) {
    visit(bytes, decoded, count);
    count += 1;
  }
};
