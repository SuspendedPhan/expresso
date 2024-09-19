import { tap } from "rxjs";

// const level_minimum = 1;
const level_minimum = 10;

/**
 * @param level Lower levels get filtered out.
 */
export function log3(level: number, ...args: any[]) {
  if (level >= level_minimum) {
    console.log(...args);
  }
}

export const log4 = {
  info(...args: any[]) {
    log3(15, ...args);
  },

  debug(...args: any[]) {
    log3(10, ...args);
  },
};

export function log5(topic: string) {
  log3(1, `[${topic}]`);

  return {
    info(...args: any[]) {
      log4.info(`[${topic}]`, ...args);
    },
    debug(...args: any[]) {
      log4.debug(`[${topic}]`, ...args);
    },
    debug2(...args: any[]) {
      log3(11, `[${topic}]`, ...args);
    },
    
    error(...args: any[]) {
      console.error(`[${topic}]`, ...args);
    },

    /**
     * @param level Lower levels get filtered out.
     */
    log3(level: number, ...args: any[]) {
      log3(level, `[${topic}]`, ...args);
    },
    tapInfo<T>(...args: any[]) {
      return tap<T>(() => {
        log4.info(`[${topic}]`, ...args);
      });
    },
    tapDebug<T>(...args: any[]) {
      return tap<T>(() => {
        log4.debug(`[${topic}]`, ...args);
      });
    },
  };
}
