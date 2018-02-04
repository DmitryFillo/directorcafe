import step from '../stepDescriptor';

describe('step descriptor tests', async () => {
  it('step call test', async () => {
    // Assert
    const stepFn = jest.fn();

    // Act
    const descriptor = step('test', stepFn, 'x', 'c');
    descriptor.step(1, 2);

    // Assert
    expect(descriptor.name).toBe('test');

    expect(stepFn.mock.calls.length).toBe(1);
    expect(stepFn.mock.calls[0][0]).toBe('x');
    expect(stepFn.mock.calls[0][1]).toBe('c');
    expect(stepFn.mock.calls[0][2]).toBe(1);
    expect(stepFn.mock.calls[0][3]).toBe(2);
  });

  it('initialize negative cases', async () => {
    // Act & Assert
    expect(() => step()).toThrow();
    expect(() => step(1)).toThrow();
    expect(() => step(undefined, () => 1)).toThrow();
  });
});
