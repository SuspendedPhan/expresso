// const ALLOWED_TOPICS: string[] | `ALL` = `ALL`;
const ALLOWED_TOPICS: string[] | `ALL` = []

export default class Logger {
    private constructor(private topic: string | null) { }

    public log(...args) {
        if (ALLOWED_TOPICS === `ALL` || ALLOWED_TOPICS.includes(this.topic)) {
            console.log(...args);
        }
    }

    static topic(topic: string) {
        return new Logger(topic);
    }

    static log(...args) {
        new Logger(null).log(...args);
    }
}