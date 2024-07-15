/*
OBS<Attribute> -> OBS<SceneObject>
*/

import { map } from "rxjs";
import { Attribute } from "../ExObjectFactory";
import MainContext from "../MainContext";
import { OBS } from "../utils/Utils";

export interface SceneObject {
  x$: OBS<number>;
  destroy$: OBS<void>;
}

function attrToSceneCircle(attr: Attribute, ctx: MainContext): SceneObject {
  return {
    x$: attr.expr$.pipe(
      map((expr) => {
        const r = ctx.goModule.evalExpr(expr.id);
        return r;
      })
    ),
    destroy$: ctx.objectManager.getDestroy$(attr).pipe(map(() => {})),
  };
}
