const level_limit = 5;

export function log4(level: number, ...args: any[]) {
    if (level >= level_limit) {
        console.log(...args);
    }
}

export const log3 = {
    info(...args: any[]) {
        log4(5, ...args);
    },

    debug(...args: any[]) {
        log4(10, ...args);
    },
};
