import { BehaviorSubject, Observable, Subject, combineLatest, map, take } from "rxjs";

export default class ArrayNavigator<T> {
  private currentIndex$ = new BehaviorSubject<number | null>(null);
  private current$ = new BehaviorSubject<T | null>(null);
  private indexOutOfBounds$ = new Subject<void>();

  public constructor(
    private objects$: Observable<T[]>,
    private equalsFn: (a: T, b: T) => boolean
  ) {
    combineLatest([this.objects$, this.currentIndex$]).subscribe(
      ([objects, index]) => {
        if (index === null) {
          this.current$.next(null);
          return;
        }

        if (index < 0 || index >= objects.length) {
          this.indexOutOfBounds$.next();
          return;
        }

        this.current$.next(objects[index]!);
      }
    );
  }

  public getIndex$(object: T) {
    return this.objects$.pipe(
      map((objects) => {
        return objects.findIndex((o) => this.equalsFn(o, object));
      })
    );
  }

  public onIndexOutOfBounds$(): Observable<void> {
    return this.indexOutOfBounds$;
  }

  public getCurrent$(): Observable<T | null> {
    return this.current$;
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
