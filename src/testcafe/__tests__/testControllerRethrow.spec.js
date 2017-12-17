import rethrow from '../testControllerRethrow';

import DirectorBaseException from '../../exceptions/DirectorBaseException';

describe('test controller rethrow', async () => {
  class TestException extends DirectorBaseException {}

  it('rethrow simple case', async () => {
    // Arrange
    const tStub = {
      executionChain: Promise.resolve(),
    };

    const act = async () => rethrow(tStub, async () => {
      await tStub.executionChain;
      throw new Error();
    }, new Error('test'));

    // Act & Assert
    await expect(act()).rejects.toHaveProperty('message', 'test');
  });

  it('rehrow with inner exception', async () => {
    // Arrange
    const tStub = {
      executionChain: Promise.resolve(),
    };

    const inner = new Error();
    const act = async () => rethrow(tStub, async () => {
      await tStub.executionChain;
      throw inner;
    }, new TestException());

    // Act & Assert
    await expect(act()).rejects.toBeInstanceOf(TestException);
    await expect(act()).rejects.toBeInstanceOf(Error);
    await expect(act()).rejects.toHaveProperty('innerException', inner);
  });

  it('test controller patching is OK', async () => {
    // Arrange
    const tStub = {
      executionChain: Promise.resolve(1),
    };

    const act = async () => rethrow(tStub, async () => {
      tStub.executionChain = tStub.executionChain.then(() => {
        throw new Error();
      });
      await tStub.executionChain;
    }, new TestException('test'));

    // Act & Assert
    await expect(act()).rejects.toHaveProperty('message', 'test');
    await expect(tStub.executionChain).resolves.toBe(1);
  });

  it('rethrow if only specific exception cathed', async () => {
    // Arrange
    const tStub = {
      executionChain: Promise.resolve(),
    };

    class SpecificException {}

    const act = async type => rethrow(tStub, async () => {
      await tStub.executionChain;
      throw new SpecificException();
    }, new TestException('test'), type);

    // Act & Assert
    await expect(act(Error)).rejects.toBeInstanceOf(SpecificException);
    await expect(act(SpecificException)).rejects.toHaveProperty('message', 'test');
  });
});
