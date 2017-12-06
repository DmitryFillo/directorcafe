import truncateGen from '../truncateGen';

it('truncate generator util works', () => {
  // Arrange
  const testGen = function* testGen() {
    yield 0;
    yield 1;
    yield 2;
    yield 3;
    yield 83;
    yield 4;
  };

  // Act
  const truncatedGen = truncateGen(testGen(), v => v % 2 === 0);

  // Assert
  expect([...truncatedGen]).toEqual([1, 3, 83]);
});
