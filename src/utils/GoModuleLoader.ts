import { BehaviorSubject, Observable, Subject } from 'rxjs'
import type GoModule from './GoModule'

export default class GoModuleLoader {
  private static goModuleSubject = new BehaviorSubject<GoModule | null>(null)

  public static get$(): Observable<GoModule> {
    return new Observable((observer) => {
      if (this.goModuleSubject.value === null) {
        // Subscribe to the subject to get notified when the library is loaded
        this.instantiate()
        this.goModuleSubject.subscribe({
          complete: () => {
            observer.next(this.goModuleSubject.value)
          }
        })
      } else {
        // Library is already loaded, emit the reference immediately
        observer.next(this.goModuleSubject.value)
      }
    })
  }

  private static instantiate() {
    const go = new Go()
    WebAssembly.instantiateStreaming(fetch('mymodule.wasm'), go.importObject).then((result) => {
      go.run(result.instance)
      const goModule = window.GoModule
      goModule.hello()
      this.goModuleSubject.next(goModule)
      this.goModuleSubject.complete()
    })
  }
}
