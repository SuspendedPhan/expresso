const level_limit = 5;

export function log3(level: number, ...args: any[]) {
    if (level >= level_limit) {
        console.log(...args);
    }
}

export const log4 = {
    info(...args: any[]) {
        log3(5, ...args);
    },

    debug(...args: any[]) {
        log3(10, ...args);
    },
};

export function log5(topic: string) {
    return {
        info(...args: any[]) {
            log4.info(`[${topic}]`, ...args);
        },
        debug(...args: any[]) {
            log4.debug(`[${topic}]`, ...args);
        },
        log3(level: number, ...args: any[]) {
            log3(level, `[${topic}]`, ...args);
        }
    }
}