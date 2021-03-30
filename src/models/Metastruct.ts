import Types from "@/models/Types";

export interface Member {
  name: string;
  type: Types | Metastruct;
}

export default class Metastruct {
  private constructor(public id: string, public members: Member[]) {}

  public static builtinMetastructs = {
    Vector: new Metastruct("dc5c7c67-6dea-4f25-9acc-687627bdaf10", [
      { name: "x", type: Types.Number },
      { name: "y", type: Types.Number }
    ]),
    SequenceOutput: new Metastruct("e3d531d3-31ce-491c-9389-d806a6138892", [
      { name: "t0", type: Types.Number },
      { name: "t1", type: Types.Number },
      { name: "t2", type: Types.Number }
    ])
  };

  static fromId(metastructId: string): Metastruct {
    for (const metastruct of Object.values(this.builtinMetastructs)) {
      if (metastruct.id === metastructId) return metastruct;
    }
    console.assert(false);
    return undefined as any;
  }
}
