import wu from "wu";
import { Root } from "./Root";
import seedrandom from "seedrandom";
import Types from "./Types";
import EasingMetafuns from "./EasingMetafuns";
import Metastruct from "@/models/Metastruct";
import {Primitive} from "@/models/Type";

const Vector = Metastruct.builtinMetastructs.Vector;

export default class MetafunStore {
  metafuns = [
    ...EasingMetafuns,
    {
      name: "Add",
      paramCount: 2,
      eval: (a, b) => {
        if (a.datatype === Primitive.Number) {
          return a.eval() + b.eval();
        } else if (a.datatype === Vector) {
          return {
            x: a.eval().x + b.eval().x,
            y: a.eval().y + b.eval().y,
          };
        }
      },
      inputTypesFromOutputType: (outputType) => {
        const ret = [outputType, outputType];
        return ret;
      },
    },
    {
      name: "Multiply",
      paramCount: 2,
      eval: (a, b) => a.eval() * b.eval(),
    },
    {
      name: "Divide",
      paramCount: 2,
      eval: (a, b) => {
        const ret = a.eval() / b.eval();

        // super hacky fix to avoid "divide by zero" from locking up the editor
        if (isNaN(ret) || ret == Infinity) {
          return 0;
        }
        return ret;
      },
    },
    {
      name: "Subtract",
      paramCount: 2,
      eval: (a, b) => a.eval() - b.eval(),
    },
    {
      name: "Modulus",
      paramCount: 2,
      eval: (a, b) => a.eval() % b.eval(),
    },
    {
      name: "Abs",
      paramCount: 1,
      eval: (a) => Math.abs(a.eval()),
    },
    {
      name: "Lerp",
      paramCount: 3,
      eval: (a, b, t) => a.eval() + t.eval() * (b.eval() - a.eval()),
    },
    {
      name: "InvLerp01",
      paramCount: 3,
      eval: (a, b, fx) =>
        Math.min(1, Math.max(0, fx.eval() / (b.eval() - a.eval()))),
    },
    {
      name: "Distance",
      paramCount: 2,
      eval: (a, b) => Math.abs(a.eval() - b.eval()),
    },
    {
      name: "SoloFront",
      paramCount: 3,
      eval: (fx, t01, twindow) => (t01.eval() < twindow.eval() ? fx.eval() : 0),
    },
    {
      name: "Tri",
      paramCount: 1,
      eval: (a) => 1 - Math.abs(a.eval() * 2 - 1),
    },
    {
      name: "Saw",
      paramCount: 2,
      eval: (t01, frequency) => {
        const ret = (t01.eval() * frequency.eval()) % 1;
        return ret;
      }
    },
    {
      name: "Square",
      paramCount: 2,
      eval: (t01, frequency) => {
        const t01FreqEval = t01.eval() * frequency.eval();
        const t01Mod = (t01FreqEval % 1 + 1) % 1;
        if (t01Mod < .5) {
          return 0;
        } else {
          return 1;
        }
      }
    },
    {
      name: "Mod1",
      paramCount: 1,
      eval: a => a.eval() % 1
    },
    {
      name: "Mod01",
      paramCount: 2,
      eval: (a, divisor) => {
        const ret = (a.eval() % divisor.eval()) / divisor.eval();
        return ret;
      }
    },
    {
      name: "CloneNumber11",
      paramCount: 2,
      eval: (cloneNumber, clones) =>
        (cloneNumber.eval() / (clones.eval() - 1) - 0.5) * 2
    },
    {
      name: "CenterX",
      paramCount: 1,
      eval: windowWidth => windowWidth.eval() / 2
    },
    {
      name: "CenterY",
      paramCount: 1,
      eval: windowHeight => windowHeight.eval() / 2
    },
    {
      name: "Time11",
      paramCount: 1,
      eval: time01 => (time01.eval() - 0.5) * 2
    },
    {
      name: "X11",
      paramCount: 2,
      eval: (x, windowWidth) =>
        Math.abs(x.eval() / windowWidth.eval() - 0.5) * 2
    },
    {
      name: "Mousex",
      paramCount: 0,
      eval: () => this.root.mostRecentClickCoordinates.x
    },
    {
      name: "Mousey",
      paramCount: 0,
      eval: () => this.root.mostRecentClickCoordinates.y
    },
    {
      name: "Random",
      paramCount: 1,
      eval: seed => seedrandom(seed.eval())()
    },

    {
      name: "Rotate",
      paramCount: 2,
      eval: (vector, angle01) => {
        const vectorVal = vector.eval();
        const angle01Val = angle01.eval();
        const radians = angle01Val * 2 * Math.PI;
        const ret = {
          x: vectorVal.x * Math.cos(radians) - vectorVal.y * Math.sin(radians),
          y: vectorVal.x * Math.sin(radians) + vectorVal.y * Math.cos(radians)
        };
        return ret;
      },
      inputTypesFromOutputType: type => {
        if (type === Vector) {
          return [Vector, Primitive.Number];
        } else {
          return undefined;
        }
      }
    },
    {
      name: "Scale",
      paramCount: 2,
      eval: (vector, scalar) => {
        const vectorVal = vector.eval();
        const scalarVal = scalar.eval();
        return {
          x: vectorVal.x * scalarVal,
          y: vectorVal.y * scalarVal
        };
      },
      inputTypesFromOutputType: type => {
        if (type === Vector) {
          return [Vector, Primitive.Number];
        } else {
          return undefined;
        }
      }
    },
    {
      name: "RotateFromUp",
      paramCount: 1,
      eval: (angle01) => {
        const vectorVal = { x: 0, y: 1 };
        const angle01Val = angle01.eval();
        const radians = angle01Val * 2 * Math.PI;
        const ret = {
          x: vectorVal.x * Math.cos(radians) - vectorVal.y * Math.sin(radians),
          y: vectorVal.x * Math.sin(radians) + vectorVal.y * Math.cos(radians)
        };
        return ret;
      },
      inputTypesFromOutputType: type => {
        if (type === Vector) {
          return [Primitive.Number];
        } else {
          return undefined;
        }
      }
    },
  ];

  constructor(private root: Root) {}

  getSerialized() {
    return {};
  }

  getFromName(name) {
    const answer = wu(this.metafuns).find(row => row.name === name);
    console.assert(answer !== undefined, "fun name");
    return answer;
  }

  getFuns() {
    return this.metafuns;
  }

  deserialize() {}
}
