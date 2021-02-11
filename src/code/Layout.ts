export interface Point {
  left: number;
  top: number;
  key: any;
}

// relative to parent
export type LocalPositionsByKey = Map<any, Point>;

export class Layout {
  private horizontalMargin = 100;
  private verticalMargin = 100;

  constructor(
    private getWidth: Function,
    private getHeight: Function,
    private getChildren: Function,
    private getKey: Function
  ) {}

  // treeRoot will always be positioned at <0, 0>
  calculate(treeRoot): LocalPositionsByKey {
    const subtreeWidthsByKey = new Map<any, number>();
    this.calculateSubtreeWidth(treeRoot, subtreeWidthsByKey);

    const key = this.getKey(treeRoot);
    const positionsByKey = new Map<any, Point>();
    positionsByKey.set(key, { left: 0, top: 0, key });
    this.calculateForChildren(treeRoot, positionsByKey, subtreeWidthsByKey);
    return positionsByKey;
  }

  private calculateForChildren(
    subroot,
    positionsByKey: LocalPositionsByKey,
    subtreeWidthsByKey: Map<any, number>
  ) {
    const subrootHeight = this.getHeight(subroot);
    const subrootWidth = this.getWidth(subroot);
    const childrenWidth = this.calculateChildrenWidth(subroot, subtreeWidthsByKey);
    let nextLeftBound = subrootWidth / 2 - childrenWidth / 2;
    for (const child of this.getChildren(subroot)) {
      const childKey = this.getKey(child);
      const childSubtreeWidth = subtreeWidthsByKey.get(childKey) as number;
      const childWidth = this.getWidth(child);
      const childX = nextLeftBound + childSubtreeWidth / 2 - childWidth / 2;
      nextLeftBound += childSubtreeWidth + this.horizontalMargin;
      const childY = subrootHeight + this.verticalMargin;
      positionsByKey.set(childKey, { left: childX, top: childY, key: childKey });
      this.calculateForChildren(child, positionsByKey, subtreeWidthsByKey);
    }
  }

  private calculateSubtreeWidth(subroot, subtreeWidthsByKey: Map<any, number>) {
    if (subtreeWidthsByKey.has(this.getKey(subroot))) { return; }

    const childrenWidth = this.calculateChildrenWidth(subroot, subtreeWidthsByKey);
    const key = this.getKey(subroot);
    const width = Math.max(childrenWidth, this.getWidth(subroot));
    subtreeWidthsByKey.set(key, width);
  }

  private calculateChildrenWidth(subroot, subtreeWidthsByKey): number {
    let childrenWidth = 0;
    const children = this.getChildren(subroot).toArray();
    for (const child of children) {
      this.calculateSubtreeWidth(child, subtreeWidthsByKey);
      const childKey = this.getKey(child);
      childrenWidth += subtreeWidthsByKey.get(childKey) as number;
    }
    const gaps = Math.max(children.length - 1, 0);
    childrenWidth += gaps * this.horizontalMargin;
    return childrenWidth;
  }
}
