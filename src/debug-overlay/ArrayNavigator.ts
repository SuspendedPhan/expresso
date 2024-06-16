import { BehaviorSubject, Observable, combineLatest, map, take } from "rxjs";

export default class ArrayNavigator<T> {
  private currentIndex$ = new BehaviorSubject<number | null>(null);

  public constructor(
    private objects$: Observable<T[]>,
    private equalsFn: (a: T, b: T) => boolean
  ) {}

  public getIndex$(object: T) {
    return this.objects$.pipe(
      map((objects) => {
        return objects.findIndex((o) => this.equalsFn(o, object));
      })
    );
  }

  public getCurrent$() {
    return combineLatest([this.objects$, this.currentIndex$]).pipe(
      map(([objects, currentIndex]) => {
        if (currentIndex === null) {
          return null;
        }

        return objects[currentIndex]!;
      }),
    //   tap(console.log)
    );
  }

  public setCurrent(object: T | null) {
    if (object === null) {
      this.currentIndex$.next(null);
      return;
    }

    this.getIndex$(object)
      .pipe(take(1))
      .subscribe((index) => {
        this.currentIndex$.next(index);
      });
  }

  public goToFirst() {
    this.currentIndex$.next(0);
  }

  public goLeft() {
    this.currentIndex$.pipe(take(1)).subscribe((index) => {
        if (index === null) {
            return;
        }
    
        if (index === 0) {
            return;
        }
        this.currentIndex$.next(index - 1);
    });
  }

  public goRight() {
    this.currentIndex$.pipe(take(1)).subscribe((index) => {
        if (index === null) {
            return;
        }
    
        this.objects$.pipe(take(1)).subscribe((objects) => {
            if (index === objects.length - 1) {
                return;
            }
            this.currentIndex$.next(index + 1);
        });
    });
  }
}
