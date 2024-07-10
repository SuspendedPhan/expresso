export default class ObservableArray<T> {
    public push(value: T): void {}
    public remove(value: T): void {}
    
    public get$(index: number): Observable<T> {}
    public length$(): Observable<number> {}
    public onPush$(): Observable<T> {}
    public onRemove$(): Observable<T> {}
}