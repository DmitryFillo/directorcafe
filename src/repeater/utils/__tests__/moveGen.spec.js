import moveGen from '../moveGen';

it('move generator util works', () => {
  // Arrange
  const testGen = function* testGen() {
    yield 0;
    yield 1;
    yield 2;
    yield 3;
    yield 83;
  };

  // Act
  const [gen, step] = moveGen(testGen(), v => v === 2);

  // Assert
  expect(step.value).toBe(2);
  expect(gen.next().value).toBe(3);
});
