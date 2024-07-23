import { combineLatest, map, Subject, switchMap } from "rxjs";
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

export interface NodeInput {
  width$: OBS<number>;
  height$: OBS<number>;
  children$: OBS<readonly Node[]>;
}

export interface Node {
  worldPosition: OBS<Point>;
}

type NodeMut = NodeInput & Node & {
  worldPositionSub$: SUB<Point>;
}

export class Layout {
  public constructor() {
  }

  public createRootNode(input: NodeInput): Node {
    const node = this.createNode(input);
    this.attach(node as NodeMut, 0, 0);
    return node;
  }

  public createNode(input: NodeInput): Node {
    const worldPositionSub$ = new Subject<Point>();
    const node: NodeMut = {
      ...input,
      worldPosition: worldPositionSub$,
      worldPositionSub$,
    };
    return node;
  }

  private attach(subroot: NodeMut, subtreeWorldLeft: number, subtreeWorldTop: number) {
    const subtreeWidth$ = this.getSubtreeWidth$(subroot);
    const subrootLeft$ = this.getNodeLeft$(subroot, subtreeWorldLeft, subtreeWidth$);
    subrootLeft$.subscribe(subrootLeft => {
      subroot.worldPositionSub$.next({left: subrootLeft, top: subtreeWorldTop});
    });

    subroot.children$.pipe(
      switchMap(children => {
        const childrenHeight$ = this.getChildrenHeight$(children as readonly NodeMut[]);
        const worldLefts$ = this.getSubtreeChildrenWorldLefts$(children as readonly NodeMut[], subtreeWorldLeft);
        return combineLatest([childrenHeight$, worldLefts$]).pipe(
          map(([childrenHeight, worldLefts]) => {
            return [children, childrenHeight, worldLefts] as const;
          })
        )
      })
    ).subscribe(([children, childrenHeight, worldLefts]) => {
      const childSubtreeWorldTop = this.getSubtreeWorldTop(childrenHeight, subtreeWorldTop);

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const worldLeft = worldLefts[i];

        if (!child || !worldLeft) {
          throw new Error("Child or worldLeft is undefined");
        }
        this.attach(child, worldLeft, childSubtreeWorldTop);
      }
    });
  }

  private getNodeLeft$(
    subroot: NodeMut,
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

  private getSubtreeWidth$(subtreeRoot: NodeMut): OBS<number> {
    return subtreeRoot.children$.pipe(
      switchMap((children) => {
        if (children.length === 0) {
          return subtreeRoot.width$;
        }

        return combineLatest(
          children.map((child) => this.getSubtreeWidth$(child as NodeMut))
        ).pipe(
          map((childrenWidths) => {
            return this.getSubtreeWidth(childrenWidths);
          })
        );
      })
    );
  }

  private getChildrenHeight$(children: readonly NodeMut[]): OBS<number> {
    return combineLatest(children.map((child) => child.height$)).pipe(
      map((heights) => {
        return this.getChildrenHeight(heights);
      })
    );
  }

  private getSubtreeWorldTop(parentRowHeight: number, parentTop: number) {
    return parentTop + parentRowHeight;
  }

  private getChildrenHeight(childHeights: number[]): number {
    return Math.max(...childHeights);
  }

  private getSubtreeWidth(childWidths: number[]): number {
    return childWidths.reduce((acc, width) => acc + width, 0);
  }

  private getSubtreeChildrenWorldLefts$(
    children: readonly NodeMut[],
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

  private getSubtreeLocalLefts$(children: readonly NodeMut[]): OBS<number[]> {
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
