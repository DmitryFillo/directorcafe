// @flow

export default function replayGenerator(
  gen: Generator<*, *, *>,
  untilFunc: (value: any) => boolean,
): [Generator<*, *, *>, any] {
  let step;

  do {
    step = gen.next();
  } while (!step.done && !untilFunc(step.value));

  return [gen, step];
}
