import { Effect } from "effect";
import { tap } from "rxjs";

/*
level 9 is for looping logs
*/

// const level_minimum = 1;
const level_minimum = 14;
// const level_minimum = 10;

/**
 * @param level Lower levels get filtered out.
 */
export function log3(level: number, ...args: any[]) {
  if (level >= level_minimum) {
    console.log(...args);
  }
}

export function error3(...args: any[]) {
  console.error(...args);
}

export const log4 = {
  info(...args: any[]) {
    log3(15, ...args);
  },

  debug(...args: any[]) {
    log3(10, ...args);
  },
};

export function log5(topic: string, levelOverride?: number) {
  log3(1, `[${topic}]`);

  return {
    info(...args: any[]) {
      log4.info(`[${topic}]`, ...args);
    },
    debug(...args: any[]) {
      log3(levelOverride ?? 10, `[${topic}]`, ...args);
    },
    debug2(...args: any[]) {
      log3(levelOverride ?? 11, `[${topic}]`, ...args);
    },

    error(...args: any[]) {
      console.error(`[${topic}]`, ...args);
    },

    /**
     * @param level Lower levels get filtered out.
     */
    log3(level: number, ...args: any[]) {
      log3(levelOverride ?? level, `[${topic}]`, ...args);
    },
    tapInfo<T>(...args: any[]) {
      return tap<T>(() => {
        this.info(`[${topic}]`, ...args);
      });
    },
    tapDebug<T>(...args: any[]) {
      return tap<T>(() => {
        this.debug(`[${topic}]`, ...args);
      });
    },
    debugEffect(...args: any[]) {
      return Effect.gen(function* () {
        log3(levelOverride ?? 10, `[${topic}]`, ...args);
      });
    },
  };
}

(window as any).log3 = log3;
(window as any).error3 = error3;
