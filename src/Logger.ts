// const ALLOWED_TOPICS: string[] | `ALL` = `ALL`;

const NONE = `None`;

const ALLOW_TOPICS: string[] | `ALL` = [`DEBUG`];
// const ALLOW_TOPICS: string[] | `ALL` = `ALL`
const DENY_TOPICS: string[] = [NONE]

export default class Logger {
    private constructor(private topic: string | null) { }

    public log(...args) {
        if (DENY_TOPICS.includes(this.topic)) {
            return;
        }

        const all = ALLOW_TOPICS === `ALL`;
        const allow = all || ALLOW_TOPICS.includes(this.topic);
        if (allow) {
            console.log(...args);
        }
    }

    static topic(topic: string) {
        return new Logger(topic);
    }

    static log(...args) {
        new Logger(NONE).log(...args);
    }
}
