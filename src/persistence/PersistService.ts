export default interface PersistService {
    readFile(name: string): Promise<any>;
    writeFile(name: string, content: any): Promise<void>;
}