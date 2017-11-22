// @flow

export default function* truncatedGenerator(
  gen: Generator<*, *, *>,
  truncateFunc: any => boolean,
): Generator<*, *, *> {
  for (const n of gen) {
    if (!truncateFunc(n)) {
      yield n;
    }
  }
}
