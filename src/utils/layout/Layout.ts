import { combineLatest, map, Subject, switchMap } from "rxjs";
import { OBS, SUB } from "../utils/Utils";
import { loggedMethod } from "../logger/LoggerDecorator";
import Logger from "../logger/Logger";

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
  id: string;
  width$: OBS<number>;
  height$: OBS<number>;
  children$: OBS<readonly Node[]>;
}

export interface Node {
  worldPosition: OBS<Point>;
}

type NodeMut = NodeInput &
  Node & {
    worldPositionSub$: SUB<Point>;
  };

export class Layout {
  public constructor() {}

  public createRootNode(input: NodeInput): Node {
    const node = this.createNode(input);
    this.attach(node as NodeMut, 0, 0);
    return node;
  }

  @loggedMethod
  public createNode(input: NodeInput): Node {
    const worldPositionSub$ = new Subject<Point>();
    const node: NodeMut = {
      ...input,
      worldPosition: worldPositionSub$,
      worldPositionSub$,
    };
    return node;
  }

  @loggedMethod
  private attach(
    subroot: NodeMut,
    subtreeWorldLeft: number,
    subtreeWorldTop: number
  ) {
    Logger.logThis();
    const logger = Logger.logger();
    logger.log("subroot", subroot);
    logger.log("subtreeWorldLeft", subtreeWorldLeft);
    logger.log("subtreeWorldTop", subtreeWorldTop);

    const subtreeWidth$ = this.getSubtreeWidth$(subroot);
    const subrootLeft$ = this.getNodeLeft$(
      subroot,
      subtreeWorldLeft,
      subtreeWidth$
    );
    subrootLeft$.subscribe((subrootLeft) => {
      logger.log("subrootLeft", subrootLeft);
      subroot.worldPositionSub$.next({
        left: subrootLeft,
        top: subtreeWorldTop,
      });
    });

    subroot.children$
      .pipe(
        switchMap((children) => {
          const childrenHeight$ = this.getChildrenHeight$(
            children as readonly NodeMut[]
          );
          const worldLefts$ = this.getSubtreeChildrenWorldLefts$(
            children as readonly NodeMut[],
            subtreeWorldLeft
          );
          return combineLatest([childrenHeight$, worldLefts$]).pipe(
            map(([childrenHeight, worldLefts]) => {
              return [children, childrenHeight, worldLefts] as const;
            })
          );
        })
      )
      .subscribe(([children, childrenHeight, worldLefts]) => {
        logger.log("children", children);
        logger.log("childrenHeight", childrenHeight);
        logger.log("worldLefts", worldLefts);

        const childSubtreeWorldTop = this.getSubtreeWorldTop(
          childrenHeight,
          subtreeWorldTop
        );

        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          const worldLeft = worldLefts[i];

          if (child === undefined || worldLeft === undefined) {
            console.log("child", child, "worldLeft", worldLeft);

            throw new Error("Child or worldLeft is undefined");
          }
          this.attach(child as NodeMut, worldLeft, childSubtreeWorldTop);
        }
      });
  }

  @loggedMethod
  private getNodeLeft$(
    subroot: NodeMut,
    subtreeWorldLeft: number,
    subtreeWidth$: OBS<number>
  ): OBS<number> {
    const logger = Logger.logger();
    logger.log("subroot", subroot);
    subroot.width$.subscribe((width) => {
      logger.log("subroot", subroot);
      logger.log("subroot width", width);
    });
    subtreeWidth$.subscribe((width) => {
      logger.log("subroot", subroot);
      logger.log("subtreeWidth", width);
    });

    return combineLatest([subroot.width$, subtreeWidth$]).pipe(
      map(([nodeWidth, subtreeWidth]) => {
        logger.log("subroot", subroot);
        logger.log("nodeWidth", nodeWidth);
        logger.log("subtreeWidth", subtreeWidth);
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

  @loggedMethod
  private getSubtreeChildrenWorldLefts$(
    children: readonly NodeMut[],
    translateX: number
  ): OBS<number[]> {
    const logger = Logger.logger();
    const localLefts$ = this.getSubtreeLocalLefts$(children);
    return localLefts$.pipe(
      map((localLefts) => {
        logger.log("localLefts", localLefts);
        return this.getSubtreeChildrenWorldLefts(localLefts, translateX);
      })
    );
  }

  @loggedMethod
  private getSubtreeChildrenWorldLefts(
    localLefts: number[],
    translateX: number
  ): number[] {
    const logger = Logger.logger();
    const worldLefts = localLefts.map((localLeft) => localLeft + translateX);

    logger.log("worldLefts", worldLefts);
    return worldLefts;
  }

  @loggedMethod
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

  @loggedMethod
  private getSubtreeLocalLefts(subtreeWidths: number[]): number[] {
    const logger = Logger.logger();
    logger.log("subtreeWidths", subtreeWidths);

    let localLefts: number[] = [];
    let localLeft = 0;
    for (const width of subtreeWidths) {
      localLefts.push(localLeft);
      localLeft += width;
    }
    return localLefts;
  }
}
