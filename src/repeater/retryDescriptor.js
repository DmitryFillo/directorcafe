// @flow

export type RetryDescriptor = {
  type: (...args: Array<any>) => Error,
  tos: Array<string>,
  maxRetryCount: number,
  exclude: Array<string>,
}

export default (
  type: (...args: Array<any>) => Error,
  to: string | Array<string>,
  retryCount: number,
  exclude: Array<string> = [],
): RetryDescriptor => {
  if (type === undefined || to === undefined || retryCount === undefined) {
    throw new Error('You should pass type, step retry to, retry count to the retryDescriptor!');
  }

  let toForReturn = [];
  if (!Array.isArray(to)) {
    toForReturn.push(to);
  } else {
    toForReturn = to;
  }

  return {
    type,
    tos: toForReturn,
    maxRetryCount: retryCount,
    exclude,
  };
};
