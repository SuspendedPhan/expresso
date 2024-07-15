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

class SceneObjectManager {
  public constructor(private readonly ctx: MainContext) {
    ctx.objectFactory.onAttributeAdded$.subscribe((attr) => {
      const sceneCircle = this.attrToSceneCircle(attr);
      this.sceneObjectToPixi(sceneCircle);
    });
  }

  public attrToSceneCircle(attr: Attribute): SceneObject {
    return {
      x$: attr.expr$.pipe(
        map((expr) => {
          const r = this.ctx.goModule.evalExpr(expr.id);
          return r;
        })
      ),
      destroy$: this.ctx.objectManager.getDestroy$(attr).pipe(map(() => {})),
    };
  }

  public sceneObjectToPixi(sceneObject: SceneObject) {
  }
}
