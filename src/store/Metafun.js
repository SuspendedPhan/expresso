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
      {
        name: 'Multiply',
        paramCount: 2,
        eval: (a, b) => a.eval() * b.eval(),
      },
      {
        name: 'Divide',
        paramCount: 2,
        eval: (a, b) => a.eval() / b.eval(),
      },
      {
        name: 'Subtract',
        paramCount: 2,
        eval: (a, b) => a.eval() - b.eval(),
      },
      {
        name: 'Lerp',
        paramCount: 3,
        eval: (a, b, t) => a.eval() + t.eval() * (b.eval() - a.eval()),
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