import Executor from '../Executor';
import step from '../stepDescriptor';
import getCurrentUrl from '../../testcafe/getCurrentUrl';

jest.mock('../../testcafe/getCurrentUrl', () => ({
  default: jest.fn(),
  __esModule: true,
}));

it('Executor test', async () => {
  // Arrange
  getCurrentUrl
    .mockReturnValueOnce('url1')
    .mockReturnValueOnce('url2');

  const logFn = jest.fn();
  const testContollerFn = jest.fn();

  const logger = {
    log: logFn,
  };

  const executor = new Executor(logger);

  const step1 = async t => t(1);
  const step2 = async (t) => {
    t(2);
    return 'test';
  };

  const gen = function* integrationTest() {
    yield step(
      'step1',
      step1,
    );

    yield step(
      'step2',
      step2,
    );
  };

  const historyThatShouldBe = {
    step1: {
      step: step1,
      name: 'step1',
      result: undefined,
      url: 'url1',
    },
    step2: {
      step: step2,
      name: 'step2',
      result: 'test',
      url: 'url2',
    },
  };

  const genInitialized = gen();

  // Act
  await executor.run(testContollerFn, genInitialized, genInitialized.next());
  const history = executor.getHistory();

  // Assert
  // t fn calls via step fns
  expect(testContollerFn.mock.calls.length).toBe(2);
  expect(testContollerFn.mock.calls[0][0]).toBe(1);
  expect(testContollerFn.mock.calls[1][0]).toBe(2);

  // get current url mock calls
  expect(getCurrentUrl.mock.calls.length).toBe(2);

  // log fn calls
  expect(logFn.mock.calls.length).toBe(4);
  expect(logFn.mock.calls[0][0]).toBe(testContollerFn);
  expect(logFn.mock.calls[0][1]).toBe('step1: before');
  expect(logFn.mock.calls[1][0]).toBe(testContollerFn);
  expect(logFn.mock.calls[1][1]).toBe('step1: after');
  expect(logFn.mock.calls[2][0]).toBe(testContollerFn);
  expect(logFn.mock.calls[2][1]).toBe('step2: before');
  expect(logFn.mock.calls[3][0]).toBe(testContollerFn);
  expect(logFn.mock.calls[3][1]).toBe('step2: after');

  // history check
  expect(history).toEqual(historyThatShouldBe);
});
