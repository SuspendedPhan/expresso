import wu from 'wu';

export default class MetafunStore {
  /**
   * @param {RootStore} rootStore 
   */
  constructor(rootStore) {
    this.rootStore = rootStore;
    this.metafuns = [
      {
        name: 'Add',
        paramCount: 2,
        eval: (a, b) => a.eval() + b.eval(),
      },
    ];
  }

  getSerialized() {
    return {};
  }

  getFromName(name) {
    const answer = wu(this.metafuns).find(row => row.name === name);
    console.assert(answer, 'fun name');
    return answer;
  }

  getFuns() {
    return this.metafuns;
  }

  deserialize() {
    
  }
}