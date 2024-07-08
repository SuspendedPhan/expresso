declare module 'deepool' {
    export default {
        create: () => {
            use: () => T;
            grow: (n: number) => void;
            recycle: (item: T) => void;
            size: () => number;
        }
    }
}