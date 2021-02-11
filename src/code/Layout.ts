export interface Point {
  x: number;
  y: number;
  key: any;
}

export type PositionsByKey = Map<any, Point>;

// treeRoot will be positioned at 0, 0
export class Layout {
  constructor(
    private getWidth: Function,
    private getHeight: Function,
    private getChildren: Function,
    private getKey: Function
  ) {}

  calculate(treeRoot): PositionsByKey {
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
    positionsByKey: PositionsByKey,
    subtreeWidthsByKey: Map<any, number>
  ) {
    const key = this.getKey(subroot);
    const position = positionsByKey.get(key) as Point;
    const subrootHeight = this.getHeight(subroot);
    console.assert(position !== undefined);

    // NOTE: trouble centering when self is wider than children? calculate sum of children width here 
    // instead of subtree width
    const width = subtreeWidthsByKey.get(key) as number;
    let nextLeftBound = position.x - width / 2;
    for (const child of this.getChildren(subroot)) {
      const childKey = this.getKey(child);
      const childWidth = this.getWidth(child);
      const childHeight = this.getHeight(child);
      const childX = nextLeftBound + childWidth / 2;
      nextLeftBound += childWidth;
      const childY = position.y + subrootHeight / 2 + childHeight / 2;
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
    const width = Math.max(childrenWidth, this.getWidth(key));
    subtreeWidthsByKey.set(key, width);
  }
}
