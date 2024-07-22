import { combineLatest, map, of, switchMap } from "rxjs";
import { OBS, SUB } from "../utils/Utils";

export interface Point {
  left: number;
  top: number;
}

// relative to world
export interface Line {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface Subtree {
  root: Node;

  width$: OBS<number>;
  localLeft$: OBS<number>;
  children$: OBS<Subtree[]>;
}

export interface Node {
  width$: OBS<number>;
  height$: OBS<number>;
  children$: OBS<Node[]>;
  worldPositionSub$: SUB<Point>;
}

export class Layout {
  public constructor(root: Node) {
    const subtree = this.getSubtree(root, of(0));
    this.updatePositionSub(subtree, 0, 0);
  }

  private updatePositionSub(
    subtree: Subtree,
    subtreeParentWorldLeft: number,
    subtreeWorldTop: number
  ) {
    combineLatest([
      subtree.localLeft$,
      subtree.width$,
      subtree.root.width$,
      subtree.root.height$,
      subtree.children$,
    ]).subscribe(
      ([subtreeLocalLeft, subtreeWidth, rootWidth, rootHeight, children]) => {
        const subtreeWorldLeft = subtreeParentWorldLeft + subtreeLocalLeft;
        const worldCenter = subtreeWorldLeft + subtreeWidth / 2;
        const rootWorldLeft = worldCenter - rootWidth / 2;

        subtree.root.worldPositionSub$.next({
          left: rootWorldLeft,
          top: subtreeWorldTop,
        });

        this.updatePositionSubForChildren(
          children,
          subtreeWorldLeft,
          subtreeWorldTop + rootHeight
        );
      }
    );
  }

  private updatePositionSubForChildren(
    children: Subtree[],
    subtreeParentWorldLeft: number,
    subtreeChildWorldTop: number
  ) {
    for (const child of children) {
      this.updatePositionSub(
        child,
        subtreeParentWorldLeft,
        subtreeChildWorldTop
      );
    }
  }

  private getSubtree(subtreeRoot: Node, localLeft$: OBS<number>): Subtree {
    return {
      root: subtreeRoot,
      width$: subtreeRoot.width$,
      localLeft$,
      children$: subtreeRoot.children$.pipe(
        map((children) => {
          if (children.length === 0) {
            return [];
          }

          return this.getSubtreesForChildren(children);
        })
      ),
    };
  }

  private getSubtreesForChildren(children: Node[]): Subtree[] {


    let localLeft$ = of(0);
    return children.map((child) => {
      const subtree = this.getSubtree(child, localLeft$);
      localLeft$ = combineLatest([localLeft$, subtree.width$]).pipe(
        map(([localLeft, width]) => {
          return localLeft + width;
        })
      );
      return subtree;
    });
  }

  private getSubtreeWidth$(subtreeRoot: Node): OBS<number> {
    return subtreeRoot.children$.pipe(
      switchMap((children) => {
        if (children.length === 0) {
          return subtreeRoot.width$;
        }

        return combineLatest(children.map((child) => this.getSubtreeWidth$(child)))
          .pipe(
            map((childrenWidths) => {
              return this.getSubtreeChildrenWidth(childrenWidths);
            })
          );
      })
    );
  }

  private getSubtreeChildrenWidth(childrenNodeWidths: number[]): number {
    return childrenNodeWidths.reduce((acc, width) => acc + width, 0);
  }

  private getSubtreeChildrenWorldLefts(localLefts: number[], translateX: number): number[] {
    let worldLefts: number[] = [];
    let worldLeft = translateX;
    for (const localLeft of localLefts) {
      worldLefts.push(worldLeft);
      worldLeft += localLeft;
    }
    return worldLefts;
  }

  private getSubtreeLocalLefts(subtreeChildrenWidths: number[]): number[] {
    let localLefts: number[] = [];
    let localLeft = 0;
    for (const width of subtreeChildrenWidths) {
      localLefts.push(localLeft);
      localLeft += width;
    }
    return localLefts;
  }
}
