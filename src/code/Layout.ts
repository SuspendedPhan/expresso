export interface Point {
  x: number;
  y: number;
  key: any;
}

// relative to parent
export type LocalPositionsByKey = Map<any, Point>;

// treeRoot will be positioned at 0, 0
export class Layout {
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
    positionsByKey.set(key, { x: 0, y: 0, key });
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
    let nextLeftBound = subrootWidth / 2 - width / 2;
    for (const child of this.getChildren(subroot)) {
      const childKey = this.getKey(child);
      const childWidth = this.getWidth(child);
      const childHeight = this.getHeight(child);
      const childX = nextLeftBound;
      nextLeftBound += childWidth;
      const childY = subrootHeight;
      positionsByKey.set(childKey, { x: childX, y: childY, key: childKey });
      this.calculateForChildren(child, positionsByKey, subtreeWidthsByKey);
    }
  }

  private calculateWidth(subroot, subtreeWidthsByKey: Map<any, number>) {
    let childrenWidth = 0;
    for (const child of this.getChildren(subroot)) {
      this.calculateWidth(child, subtreeWidthsByKey);
      const childKey = this.getKey(child);
      childrenWidth += subtreeWidthsByKey.get(childKey) as number;
    }

    const key = this.getKey(subroot);
    const width = Math.max(childrenWidth, this.getWidth(subroot));
    subtreeWidthsByKey.set(key, width);
  }
}
