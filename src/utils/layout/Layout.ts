import { combineLatest, map, Observable, of, switchAll, switchMap } from "rxjs";
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
    this.attach(root, 0);
  }

  private attach(subroot: Node, subtreeWorldLeft: number) {
    const subtreeWidth$ = this.getSubtreeWidth$(subroot);
    const subrootLeft$ = this.getNodeLeft$(subroot, subtreeWorldLeft, subtreeWidth$);
    subrootLeft$.subscribe(subrootLeft => {
      subroot.worldPositionSub$.next({left: subrootLeft, top: 0});
    });

    subroot.children$.pipe(
      switchMap(children => {
        const worldLefts$: OBS<[Node[], number[]]> = this.getSubtreeChildrenWorldLefts$(children, subtreeWorldLeft).pipe(
          map(worldLefts => {
            return [children, worldLefts];
          })
        );
        return worldLefts$;
      })
      
    ).subscribe(([children, worldLefts]) => {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const worldLeft = worldLefts[i];

        if (!child || !worldLeft) {
          throw new Error("Child or worldLeft is undefined");
        }
        this.attach(child, worldLeft);
      }
    });
  }

  private getNodeLeft$(
    subroot: Node,
    subtreeWorldLeft: number,
    subtreeWidth$: OBS<number>
  ): OBS<number> {
    return combineLatest([subroot.width$, subtreeWidth$]).pipe(
      map(([nodeWidth, subtreeWidth]) => {
        return this.getNodeLeft(nodeWidth, subtreeWorldLeft, subtreeWidth);
      })
    );
  }

  private getNodeLeft(
    nodeWidth: number,
    subtreeWorldLeft: number,
    subtreeWidth: number
  ): number {
    return subtreeWorldLeft + (subtreeWidth - nodeWidth) / 2;
  }

  private getSubtreeWidth$(subtreeRoot: Node): OBS<number> {
    return subtreeRoot.children$.pipe(
      switchMap((children) => {
        if (children.length === 0) {
          return subtreeRoot.width$;
        }

        return combineLatest(
          children.map((child) => this.getSubtreeWidth$(child))
        ).pipe(
          map((childrenWidths) => {
            return this.getSubtreeWidth(childrenWidths);
          })
        );
      })
    );
  }

  private getMaxHeight$(children: Node[]): OBS<number> {
    return combineLatest(children.map((child) => child.height$)).pipe(
      map((heights) => {
        return this.getMaxHeight(heights);
      })
    );
  }

  private getSubtreeWorldTop(parentRowHeight: number, parentTop: number) {
    return parentTop + parentRowHeight;
  }

  private getMaxHeight(heights: number[]): number {
    return Math.max(...heights);
  }

  private getSubtreeWidth(childWidths: number[]): number {
    return childWidths.reduce((acc, width) => acc + width, 0);
  }

  private getSubtreeChildrenWorldLefts$(
    children: Node[],
    translateX: number
  ): OBS<number[]> {
    const localLefts$ = this.getSubtreeLocalLefts$(children);
    return localLefts$.pipe(
      map((localLefts) => {
        return this.getSubtreeChildrenWorldLefts(localLefts, translateX);
      })
    );
  }

  private getSubtreeChildrenWorldLefts(
    localLefts: number[],
    translateX: number
  ): number[] {
    let worldLefts: number[] = [];
    let worldLeft = translateX;
    for (const localLeft of localLefts) {
      worldLefts.push(worldLeft);
      worldLeft += localLeft;
    }
    return worldLefts;
  }

  private getSubtreeLocalLefts$(children: Node[]): OBS<number[]> {
    const subtreeWidths$ = combineLatest(
      children.map((child) => this.getSubtreeWidth$(child))
    );
    return subtreeWidths$.pipe(
      map((subtreeWidths) => {
        return this.getSubtreeLocalLefts(subtreeWidths);
      })
    );
  }

  private getSubtreeLocalLefts(subtreeWidths: number[]): number[] {
    let localLefts: number[] = [];
    let localLeft = 0;
    for (const width of subtreeWidths) {
      localLefts.push(localLeft);
      localLeft += width;
    }
    return localLefts;
  }
}
