import { map, switchMap } from "rxjs";
import type { OBS, SUB } from "src/utils/utils/Utils";

export interface Layout2Context {
  nodeById$: SUB<Map<string, Node>>;
}

export interface Position {
  left: number;
  top: number;
}

interface Node {
  position$: SUB<Position>;
  width$: SUB<number>;
  height$: SUB<number>;
}

export namespace Layout2 {
  export function getNode$(ctx: Layout2Context, nodeId: string): OBS<Node> {
    return ctx.nodeById$.pipe(
      map((nodeById) => {
        const node = nodeById.get(nodeId);
        if (!node) {
          throw new Error(`Node with id ${nodeId} not found`);
        }

        return node;
      })
    );
  }

  export function getPosition$(
    ctx: Layout2Context,
    nodeId: string
  ): OBS<Position> {
    return ctx.nodeById$.pipe(
      switchMap((nodeById) => {
        const node = nodeById.get(nodeId);
        if (!node) {
          throw new Error(`Node with id ${nodeId} not found`);
        }
        return node.position$;
      })
    );
  }
}
