import type { NumberExpr } from '@/domain/Domain'
import { BehaviorSubject, Observable, Subject } from 'rxjs'
import type { GoModule } from './GoModule'

export default class GoModuleLoader {
  private static goModuleSubject = new BehaviorSubject<GoModule | null>(null)

  public static get(): Observable<GoModule> {
    return new Observable((observer) => {
      if (this.goModuleSubject.value === null) {
        // Subscribe to the subject to get notified when the library is loaded
        this.instantiate()
        this.goModuleSubject.subscribe({
          complete: () => {
            observer.next(this.goModuleSubject.value)
            console.log('observer.next')
          }
        })
      } else {
        // Library is already loaded, emit the reference immediately
        console.log(this.goModuleSubject.value)
        console.log('this.goModuleSubject.value')
        observer.next(this.goModuleSubject.value)
      }
    })
  }

  private static instantiate() {
    const go = new Go()
    WebAssembly.instantiateStreaming(fetch('mymodule.wasm'), go.importObject).then((result) => {
      go.run(result.instance)
      const h = window.GoModule.hello()
      console.log(h)
      console.log(window.GoModule)
      this.goModuleSubject.next(window.GoModule)
      this.goModuleSubject.complete()
    })
  }
}
