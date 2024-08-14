import { map, ReplaySubject, Subject } from "rxjs";
import type { ExObject } from "src/ex-object/ExObject";
import type MainContext from "src/main-context/MainContext";
import type { ElementLayout } from "src/utils/layout/ElementLayout";
import ExObjectLayout from "src/utils/layout/ExObjectLayout";
import type ObservableArray from "src/utils/utils/ObservableArray";
import type { OBS } from "src/utils/utils/Utils";

export interface RootExObjectViewProps {
  exObject: ExObject;
  elementLayout: ElementLayout;
}

export namespace RootExObjectViewFns {
  export function get$(
    ctx: MainContext,
    rootExObjectsOArr: ObservableArray<ExObject>
  ): OBS<RootExObjectViewProps[]> {
    const rootExObjectProps: RootExObjectViewProps[] = [];
    const rootExObjectProps$ = new ReplaySubject<RootExObjectViewProps[]>(1);
    rootExObjectsOArr.onChange$().pipe(
      map((event) => {
        switch (event.change.type) {
          case "InitialSubscription":
            const exObjects = event.items;
            exObjects.forEach((exObject) => {
              const props: RootExObjectViewProps = {
                exObject,
                elementLayout: ExObjectLayout.create(ctx, exObject),
              };
              rootExObjectProps.push(props);
            });
            rootExObjectProps$.next(rootExObjectProps);
            return;
          case "ItemAdded":
            const exObject = event.change.item;
            const props: RootExObjectViewProps = {
              exObject,
              elementLayout: ExObjectLayout.create(ctx, exObject),
            };
            rootExObjectProps.push(props);
            rootExObjectProps$.next(rootExObjectProps);
            return;
          default:
            return;
        }
      })
    );

    const props$ = rootExObjects$.pipe(
      map((rootExObjects) => {
        return rootExObjects.map((exObject) => {
          return {
            exObject,
            elementLayout: ExObjectLayout.create(ctx, exObject),
          };
        });
      })
    );
    return props$;
  }
}
