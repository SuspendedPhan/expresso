function makeTagFactory<T extends { _tag: string }>(tag: string) {
  return (value: Omit<T, "_tag">) => {
    return {
      tag,
      ...value,
    }
  }
}
