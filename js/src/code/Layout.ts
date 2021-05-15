export interface Point {
  left: number;
  top: number;
  key: any;
}

// relative to world
export interface Line {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// relative to parent
export type LocalPositionsByKey = Map<any, Point>;
export interface Output {
  localPositionsByKey: LocalPositionsByKey;
  lines: Line[];
  totalWidth: number;
  totalHeight: number;
}

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
  calculate(treeRoot): Output {
    const subtreeWidthsByKey = new Map<any, number>();
    const subtreeHeightsByKey = new Map<any, number>();
    this.calculateSubtreeWidth(treeRoot, subtreeWidthsByKey);
    this.calculateSubtreeHeight(treeRoot, subtreeHeightsByKey);

    const treeRootKey = this.getKey(treeRoot);

    const totalWidth = subtreeWidthsByKey.get(treeRootKey) as number;
    const totalHeight = subtreeHeightsByKey.get(treeRootKey) as number;

    const rootWorldLeft = totalWidth / 2 - this.getWidth(treeRoot) / 2;
    const rootWorldTop = 0;

    const localPositionsByKey = new Map<any, Point>();
    localPositionsByKey.set(treeRootKey, { left: rootWorldLeft, top: rootWorldTop, key: treeRootKey });
    this.calculateForChildren(
      treeRoot,
      localPositionsByKey,
      subtreeWidthsByKey
    );
    const lines = [];



    this.calculateLinesFromParentToChildren(
      treeRoot,
      { left: rootWorldLeft, top: rootWorldTop },
      localPositionsByKey,
      lines
    );

    return {
      localPositionsByKey,
      lines,
      totalWidth,
      totalHeight
    };
  }

  /**
   * Local positions, subtree widths, and subtree heights.
   */
  private calculateForChildren(
    subroot,
    localPositionsByKey: LocalPositionsByKey,
    subtreeWidthsByKey: Map<any, number>,
  ) {
    const subrootHeight = this.getHeight(subroot);
    const subrootWidth = this.getWidth(subroot);
    const childrenWidth = this.calculateChildrenWidth(
      subroot,
      subtreeWidthsByKey
    );
    let nextLeftBound = subrootWidth / 2 - childrenWidth / 2;
    for (const child of this.getChildren(subroot)) {
      const childKey = this.getKey(child);
      const childSubtreeWidth = subtreeWidthsByKey.get(childKey) as number;
      const childWidth = this.getWidth(child);
      const childX = nextLeftBound + childSubtreeWidth / 2 - childWidth / 2;
      nextLeftBound += childSubtreeWidth + this.horizontalMargin;
      const childY = subrootHeight + this.verticalMargin;
      localPositionsByKey.set(childKey, {
        left: childX,
        top: childY,
        key: childKey,
      });
      this.calculateForChildren(child, localPositionsByKey, subtreeWidthsByKey);
    }
  }

  private calculateSubtreeWidth(subroot, subtreeWidthsByKey: Map<any, number>) {
    if (subtreeWidthsByKey.has(this.getKey(subroot))) {
      return;
    }

    const childrenWidth = this.calculateChildrenWidth(
      subroot,
      subtreeWidthsByKey
    );
    const key = this.getKey(subroot);
    const width = Math.max(childrenWidth, this.getWidth(subroot));
    subtreeWidthsByKey.set(key, width);
  }

  private calculateSubtreeHeight(subroot, subtreeHeightsByKey: Map<any, number>) {
    if (subtreeHeightsByKey.has(this.getKey(subroot))) {
      return;
    }

    const children = Array.from(this.getChildren(subroot));
    if (children.length === 0) {
      const subrootHeight = this.getHeight(subroot);
      subtreeHeightsByKey.set(this.getKey(subroot), subrootHeight);
      return;
    }

    let maxHeight = 0;
    for (const child of children) {
      this.calculateSubtreeHeight(child, subtreeHeightsByKey);
      const childHeight = subtreeHeightsByKey.get(this.getKey(child)) as number;
      maxHeight = Math.max(maxHeight, childHeight);
    }

    const subtreeHeight = this.getHeight(subroot) + this.verticalMargin + maxHeight;
    subtreeHeightsByKey.set(this.getKey(subroot), subtreeHeight);
  }

  private calculateChildrenWidth(subroot, subtreeWidthsByKey): number {
    let childrenWidth = 0;
    const children = Array.from(this.getChildren(subroot));
    for (const child of children) {
      this.calculateSubtreeWidth(child, subtreeWidthsByKey);
      const childKey = this.getKey(child);
      childrenWidth += subtreeWidthsByKey.get(childKey) as number;
    }
    const gaps = Math.max(children.length - 1, 0);
    childrenWidth += gaps * this.horizontalMargin;
    return childrenWidth;
  }

  private calculateLinesFromParentToChildren(
    subroot,
    subrootWorldPosition,
    localPositionsByKey,
    lines
  ) {
    const subrootWorldCenter = {
      x: subrootWorldPosition.left + this.getWidth(subroot) / 2,
      y: subrootWorldPosition.top + this.getHeight(subroot) / 2,
    };
    const children = this.getChildren(subroot);
    for (const child of children) {
      const childLocalPosition = localPositionsByKey.get(this.getKey(child));
      const childWorldPosition = {
        left: subrootWorldPosition.left + childLocalPosition.left,
        top: subrootWorldPosition.top + childLocalPosition.top,
      };
      const childWorldCenter = {
        x: childWorldPosition.left + this.getWidth(child) / 2,
        y: childWorldPosition.top + this.getHeight(child) / 2,
      };
      const line = {
        startX: subrootWorldCenter.x,
        startY: subrootWorldCenter.y,
        endX: childWorldCenter.x,
        endY: childWorldCenter.y,
      };

      lines.push(line);
      this.calculateLinesFromParentToChildren(
        child,
        childWorldPosition,
        localPositionsByKey,
        lines
      );
    }
  }
}
