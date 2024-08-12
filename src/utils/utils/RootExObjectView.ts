import { map } from "rxjs";
import type { ExObject } from "src/ex-object/ExObject";
import type MainContext from "src/main-context/MainContext";
import type { ElementLayout } from "src/utils/layout/ElementLayout";
import ExObjectLayout from "src/utils/layout/ExObjectLayout";
import type { OBS } from "src/utils/utils/Utils";

export interface RootExObjectViewProps {
  exObject: ExObject;
  elementLayout: ElementLayout;
}

export namespace RootExObjectViewPropsFns {
    export function get$(ctx: MainContext, rootExObjects$: OBS<readonly ExObject[]>): OBS<RootExObjectViewProps[]> {
        const props$ = rootExObjects$.pipe(map((rootExObjects) => {
        return rootExObjects.map((exObject) => {
          return {
            exObject,
            elementLayout: ExObjectLayout.create(ctx, exObject),
          };
        });
      }));
      return props$;
    }
}
