import { BehaviorSubject, connect, map, reduce, share } from "rxjs";
import type { ExObject } from "src/ex-object/ExObject";
import type MainContext from "src/main-context/MainContext";
import type { ElementLayout } from "src/utils/layout/ElementLayout";
import ExObjectLayout from "src/utils/layout/ExObjectLayout";
import {
  type ArrayEvent,
  ObservableArray,
} from "src/utils/utils/ObservableArray";
import type { OBS } from "src/utils/utils/Utils";

export interface RootExObjectViewProps {
  exObject: ExObject;
  elementLayout: ElementLayout;
}

export namespace RootExObjectViewFns {
  export function get$(
    ctx: MainContext,
    rootExObjectArrEvt$: OBS<ArrayEvent<ExObject>>
  ): OBS<RootExObjectViewProps[]> {
    const rootExObjectArr$ = rootExObjectArrEvt$.pipe(
      ObservableArray.mapToArray((exObject) => {
        const props: RootExObjectViewProps = {
          exObject,
          elementLayout: ExObjectLayout.create(ctx, exObject),
        };
        return props;
      }),
    );
    return rootExObjectArr$;
  }
}
