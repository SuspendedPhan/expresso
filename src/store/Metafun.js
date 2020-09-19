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
        name: 'Abs',
        paramCount: 1,
        eval: (a) => Math.abs(a.eval()),
      },
      {
        name: 'Lerp',
        paramCount: 3,
        eval: (a, b, t) => a.eval() + t.eval() * (b.eval() - a.eval()),
      },
      {
        name: 'Distance',
        paramCount: 2,
        eval: (a, b) => Math.abs(a.eval() - b.eval()),
      },
      {
        name: 'CloneNumber01',
        paramCount: 2,
        eval: (cloneNumber, clones) => cloneNumber.eval() / (clones.eval() - 1),
      },
      {
        name: 'CloneNumber11',
        paramCount: 2,
        eval: (cloneNumber, clones) => Math.abs(cloneNumber.eval() / (clones.eval() - 1) - .5) * 2,
      },
      {
        name: 'CenterX',
        paramCount: 1,
        eval: (windowWidth) => windowWidth.eval() / 2,
      },
      {
        name: 'CenterY',
        paramCount: 1,
        eval: (windowHeight) => windowHeight.eval() / 2,
      },
      {
        name: 'Time11',
        paramCount: 1,
        eval: (time01) => Math.abs(time01.eval() - .5) * 2,
      },
      {
        name: 'X11',
        paramCount: 2,
        eval: (x, windowWidth) => Math.abs(x / windowWidth - .5) * 2,
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