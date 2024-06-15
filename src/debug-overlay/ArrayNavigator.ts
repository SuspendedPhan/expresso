import { BehaviorSubject, Observable, take } from "rxjs";

export default class ArrayNavigator<T> {
    private current$ = new BehaviorSubject<T | null>(null);

    public constructor(private objects$: Observable<T[]>, private equalsFn: (a: T, b: T) => boolean) {

    }

    public setCurrent(object: T | null) {
        this.current$.next(object);
    }

    public getCurrent$() {
        return this.current$;
    }

    public goToFirst() {
        this.objects$.pipe(take(1)).subscribe(objects => {
            if (objects.length === 0) {
                return;
            }

            this.current$.next(objects[0]!);
        });
    }

    public goLeft() {
        this.objects$.pipe(take(1)).subscribe(objects => {
            if (objects.length === 0) {
                return;
            }

            const current = this.current$.value;
            if (current === null) {
                return;
            }

            const currentIndex = objects.findIndex(object => {
                return this.equalsFn(object, current);
            });

            if (currentIndex === -1) {
                console.error("Current object not found in objects");
                return;
            }

            const nextIndex = currentIndex - 1;
            if (nextIndex < 0) {
                return;
            }

            this.current$.next(objects[nextIndex]!);
        });
    }

    public goRight() {
        this.objects$.pipe(take(1)).subscribe(objects => {
            if (objects.length === 0) {
                return;
            }

            const current = this.current$.value;
            if (current === null) {
                this.current$.next(objects[0]!);
                return;
            }

            const currentIndex = objects.findIndex(object => {
                return this.equalsFn(object, current);
            });

            if (currentIndex === -1) {
                console.error("Current object not found in objects");
                return;
            }

            const nextIndex = currentIndex + 1;
            if (nextIndex >= objects.length) {
                return;
            }

            this.current$.next(objects[nextIndex]!);
        });        
    }
}