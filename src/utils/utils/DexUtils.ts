export const DexUtils = {
  hasTag(obj: any): obj is { _tag: string } {
    return obj._tag !== undefined;
  },
};
