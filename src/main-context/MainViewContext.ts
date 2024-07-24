import { BehaviorSubject } from "rxjs";
import { ElementLayout } from "src/utils/layout/ElementLayout";

export default class MainViewContext {
  public readonly componentLayouts$ = new BehaviorSubject<
    readonly ElementLayout[]
  >([]);
}
