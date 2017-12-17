// @flow

import DirectorBaseException from '../exceptions/DirectorBaseException';

export default async (
  t: TestCafe$TestController,
  assert: () => Promise<any>,
  exception: Error,
  type: ?(...args: Array<any>) => Error = null,
): Promise<any> => {
  // $FlowFixMe undocumented and no typedef
  const ec = t.executionChain.then();
  const tt = t;
  try {
    return await assert();
  } catch (e) {
    if (type && !(e instanceof type)) {
      throw e;
    }

    if (exception instanceof DirectorBaseException) {
      exception.setInnerException(e);
    }
  }
  /*
    NOTE:
    TestCafe chains promises internally, so we need to remove
    try-catch-promise from the chain to get rid of future error raising
  */
  tt.executionChain = ec;
  throw exception;
};
