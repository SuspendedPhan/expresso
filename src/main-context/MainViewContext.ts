import { ReplaySubject } from "rxjs";

export default class MainViewContext {
    public readonly editorViewWidth$ = new ReplaySubject<number>(1);
}