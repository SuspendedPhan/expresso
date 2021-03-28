import Types from "@/models/Types";

export interface Member {
  name: string;
  type: Types | Metastruct;
}

export default class Metastruct {
  private constructor(public id: string, public members: Member[]) {}

  public static builtinMetastructs = {
    Vector: new Metastruct("123", [
      { name: "x", type: Types.Number },
      { name: "y", type: Types.Number }
    ]),
    SequenceOutput: new Metastruct("123", [
      { name: "t0", type: Types.Number },
      { name: "t1", type: Types.Number },
      { name: "t2", type: Types.Number }
    ])
  };

  static fromId(metastructId: string): Metastruct {

  }
}

//
