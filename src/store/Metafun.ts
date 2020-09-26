import wu from 'wu';
import { Root } from './Root';

export default class MetafunStore {
  metafuns = [
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
      name: 'Modulus',
      paramCount: 2,
      eval: (a, b) => a.eval() % b.eval(),
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
      name: 'InvLerp01',
      paramCount: 3,
      eval: (a, b, fx) => Math.min(1, Math.max(0, (fx.eval() / (b.eval() - a.eval())))),
    },
    {
      name: 'Distance',
      paramCount: 2,
      eval: (a, b) => Math.abs(a.eval() - b.eval()),
    },
    {
      name: 'SoloFront',
      paramCount: 3,
      eval: (fx, t01, twindow) => t01.eval() < twindow.eval() ? fx.eval() : 0,
    },
    {
      name: 'Tri',
      paramCount: 1,
      eval: (a) => 1 - Math.abs(a.eval() * 2 - 1),
    },
    {
      name: 'Mod1',
      paramCount: 1,
      eval: (a) => a.eval() % 1,
    },
    {
      name: 'CloneNumber01',
      paramCount: 2,
      eval: (cloneNumber, clones) => cloneNumber.eval() / (clones.eval() - 1),
    },
    {
      name: 'CloneNumber11',
      paramCount: 2,
      eval: (cloneNumber, clones) => (cloneNumber.eval() / (clones.eval() - 1) - .5) * 2,
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
      eval: (time01) => (time01.eval() - .5) * 2,
    },
    {
      name: 'X11',
      paramCount: 2,
      eval: (x, windowWidth) => Math.abs(x / windowWidth - .5) * 2,
    },
  ];

  constructor(private root: Root) {}


  getSerialized() {
    return {};
  }

  getFromName(name) {
    const answer = wu(this.metafuns).find(row => row.name === name);
    console.assert(answer !== undefined, 'fun name');
    return answer;
  }

  getFuns() {
    return this.metafuns;
  }

  deserialize() {
    
  }
}