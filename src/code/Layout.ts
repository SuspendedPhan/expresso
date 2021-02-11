export interface Point {
  left: number;
  top: number;
  key: any;
}

// relative to parent
export type LocalPositionsByKey = Map<any, Point>;

// treeRoot will be positioned at 0, 0
export class Layout {
  private horizontalMargin = 100;
  private verticalMargin = 100;

  constructor(
    private getWidth: Function,
    private getHeight: Function,
    private getChildren: Function,
    private getKey: Function
  ) {}

  calculate(treeRoot): LocalPositionsByKey {
    const subtreeWidthsByKey = new Map<any, number>();
    this.calculateWidth(treeRoot, subtreeWidthsByKey);

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
    const key = this.getKey(subroot);
    const subrootHeight = this.getHeight(subroot);
    const subrootWidth = this.getWidth(subroot);

    // NOTE: trouble centering when self is wider than children? calculate sum of children width here 
    // instead of subtree width
    const width = subtreeWidthsByKey.get(key) as number;
    let childrenWidth = 0;
    const children = this.getChildren(subroot).toArray();
    for (const child of this.getChildren(subroot)) {
      const childKey = this.getKey(child);
      childrenWidth += subtreeWidthsByKey.get(childKey);
    }
    childrenWidth += (children.length - 1) * this.horizontalMargin;

    let nextLeftBound = subrootWidth / 2 - childrenWidth / 2;
    // let nextLeftBound = subrootWidth / 2 - width / 2;
    for (const child of this.getChildren(subroot)) {
      const childKey = this.getKey(child);
      const childWidth = this.getWidth(child);
      const childX = nextLeftBound;
      nextLeftBound += childWidth + this.horizontalMargin;
      const childY = subrootHeight + this.verticalMargin;
      positionsByKey.set(childKey, { left: childX, top: childY, key: childKey });
      this.calculateForChildren(child, positionsByKey, subtreeWidthsByKey);
    }
  }

  private calculateWidth(subroot, subtreeWidthsByKey: Map<any, number>) {
    let childrenWidth = 0;
    const children = this.getChildren(subroot).toArray();
    for (const child of children) {
      this.calculateWidth(child, subtreeWidthsByKey);
      const childKey = this.getKey(child);
      childrenWidth += subtreeWidthsByKey.get(childKey) as number;
    }
    const gaps = Math.max(children.length - 1, 0);
    childrenWidth += gaps * this.horizontalMargin;

    const key = this.getKey(subroot);
    const width = Math.max(childrenWidth, this.getWidth(subroot));
    subtreeWidthsByKey.set(key, width);
  }
}
