// @flow

export type ExcludeDescriptor = {
  exclude: Array<string>,
  permanent: boolean,
}

export default (
  exclude: Array<string>,
  permanent: boolean = true,
): ExcludeDescriptor => ({
  exclude,
  permanent,
});
