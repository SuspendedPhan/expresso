import wu from "wu";
import { Root } from "./Root";
import seedrandom from "seedrandom";
import Types from "./Types";
import EasingMetafuns from "./EasingMetafuns";
import Metastruct from "@/models/Metastruct";
import { Primitive } from "@/models/Type";

interface Arg {
  datatype: Types;
  value: any;
}

const Vector = Metastruct.builtinMetastructs.Vector;

function invlerp(start, end, x) {
  return (x - start) / (end - start);
}

function clamp01(t) {
  if (t < 0) return 0;
  if (t > 1) return 1;
  return t;
}

export default class MetafunStore {
  metafuns = [
    ...EasingMetafuns,
    {
      name: "Add",
      paramCount: 2,
      evalTypedArgs: (a, b) => {
        if (a.datatype === Primitive.Number) {
          return a.value + b.value;
        } else if (a.datatype === Vector) {
          return {
            x: a.value.x + b.value.x,
            y: a.value.y + b.value.y
          };
        }
      },
      inputTypesFromOutputType: outputType => {
        const ret = [outputType, outputType];
        return ret;
      },
      defaultOutputType: Primitive.Number
    },
    {
      name: "Multiply",
      paramCount: 2,
      eval: (a, b) => a * b
    },
    {
      name: "Divide",
      paramCount: 2,
      eval: (a, b) => {
        const ret = a / b;

        // super hacky fix to avoid "divide by zero" from locking up the editor
        if (isNaN(ret) || ret == Infinity) {
          return 0;
        }
        return ret;
      }
    },
    {
      name: "Subtract",
      paramCount: 2,
      eval: (a, b) => a - b
    },
    {
      name: "Modulus",
      paramCount: 2,
      eval: (a, b) => a % b
    },
    {
      name: "Abs",
      paramCount: 1,
      eval: a => Math.abs(a)
    },
    {
      name: "Lerp",
      paramCount: 3,
      eval: (a, b, t) => a + t * (b - a)
    },
    {
      name: "InvLerp01",
      paramCount: 3,
      eval: (a, b, fx) =>
        Math.min(1, Math.max(0, fx / (b - a)))
    },
    {
      name: "Distance",
      paramCount: 2,
      eval: (a, b) => Math.abs(a - b)
    },
    {
      name: "SoloFront",
      paramCount: 3,
      eval: (fx, t01, twindow) => (t01 < twindow ? fx : 0)
    },
    {
      name: "Tri",
      paramCount: 1,
      eval: a => 1 - Math.abs(a * 2 - 1)
    },
    {
      name: "Saw",
      paramCount: 2,
      eval: (t01, frequency) => {
        const ret = (t01 * frequency) % 1;
        return ret;
      }
    },
    {
      name: "Square",
      paramCount: 2,
      eval: (t01, frequency) => {
        const t01FreqEval = t01 * frequency;
        const t01Mod = ((t01FreqEval % 1) + 1) % 1;
        if (t01Mod < 0.5) {
          return 0;
        } else {
          return 1;
        }
      }
    },
    {
      name: "Mod1",
      paramCount: 1,
      eval: a => a % 1
    },
    {
      name: "Mod01",
      paramCount: 2,
      eval: (a, divisor) => {
        const ret = (a % divisor) / divisor;
        return ret;
      }
    },
    {
      name: "CloneNumber11",
      paramCount: 2,
      eval: (cloneNumber, clones) =>
        (cloneNumber / (clones - 1) - 0.5) * 2
    },
    {
      name: "CenterX",
      paramCount: 1,
      eval: windowWidth => windowWidth / 2
    },
    {
      name: "CenterY",
      paramCount: 1,
      eval: windowHeight => windowHeight / 2
    },
    {
      name: "Time11",
      paramCount: 1,
      eval: time01 => (time01 - 0.5) * 2
    },
    {
      name: "X11",
      paramCount: 2,
      eval: (x, windowWidth) =>
        Math.abs(x / windowWidth - 0.5) * 2
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
      eval: seed => seedrandom(seed)()
    },

    {
      name: "Rotate",
      paramCount: 2,
      eval: (vector, angle01) => {
        const vectorVal = vector;
        const angle01Val = angle01;
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
      },
      defaultOutputType: Vector
    },
    {
      name: "Scale",
      paramCount: 2,
      eval: (vector, scalar) => {
        const vectorVal = vector;
        const scalarVal = scalar;
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
      },
      defaultOutputType: Vector
    },
    {
      name: "RotateFromUp",
      paramCount: 1,
      eval: angle01 => {
        const vectorVal = { x: 0, y: -1 };
        const angle01Val = angle01;
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
      },
      defaultOutputType: Vector
    },
    {
      name: "Sequence3",
      paramCount: 4,
      eval: (duration0, duration1, duration2, time) => {
        const duration0Eval = duration0;
        const duration1Eval = duration1;
        const duration2Eval = duration2;
        const timeEval = time;
        const totalDuration = duration0Eval + duration1Eval + duration2Eval;
        const windowTime = timeEval % totalDuration;
        const ret = {
          t0: clamp01(invlerp(0, duration0Eval, windowTime)) || 0,
          t1:
            clamp01(
              invlerp(duration0Eval, duration0Eval + duration1Eval, windowTime)
            ) || 0,
          t2:
            clamp01(
              invlerp(
                duration0Eval + duration1Eval,
                duration0Eval + duration1Eval + duration2Eval,
                windowTime
              )
            ) || 0
        };
        return ret;
      },
      inputTypesFromOutputType: type => {
        if (type === Metastruct.builtinMetastructs.SequenceOutput) {
          return [
            Primitive.Number,
            Primitive.Number,
            Primitive.Number,
            Primitive.Number
          ];
        } else {
          return undefined;
        }
      },
      defaultOutputType: Metastruct.builtinMetastructs.SequenceOutput
    },
    {
      name: "MapSequence3",
      paramCount: 6,
      eval: (value0, t0, value1, t1, value2, t2) => {
        const value0Eval = value0;
        const t0Eval = t0;
        const value1Eval = value1;
        const t1Eval = t1;
        const value2Eval = value2;
        const t2Eval = t2;
        if (t0Eval > 0 && t0Eval < 1) {
          return value0Eval;
        } else if (t1Eval > 0 && t1Eval < 1) {
          return value1Eval;
        } else if (t2Eval > 0 && t2Eval < 1) {
          return value2Eval;
        } else {
          return value0Eval;
        }
      },
    }
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
