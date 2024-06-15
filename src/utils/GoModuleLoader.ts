import { Observable, Subscriber } from 'rxjs'
import type GoModule from './GoModule'

declare var window: any;

// Defined in public/wasm_exec.js
declare var Go: any;

export default class GoModuleLoader {
  private static goModule: GoModule | null = null;

  public static get$(): Observable<GoModule> {
    return new Observable(this.handleSubscribe.bind(this));
  }

  private static handleSubscribe(subscriber: Subscriber<GoModule>) {
    if (this.goModule === null) {
      this.instantiate().then((goModule) => {
        this.goModule = goModule;
        subscriber.next(goModule);
      });
    } else {
      subscriber.next(this.goModule);
    }
  }

  private static async instantiate(): Promise<GoModule> {
    const go = new Go();
    const result = await WebAssembly.instantiateStreaming(fetch('mymodule.wasm'), go.importObject);
    go.run(result.instance);
    const goModule = window.GoModule;
    goModule.hello();
    return goModule;
  }
}
