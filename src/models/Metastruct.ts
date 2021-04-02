import Type, { Primitive } from "@/models/Type";

export interface Member {
  name: string;
  type: Type;
}

export default class Metastruct extends Type {
  private constructor(id: string, public members: Member[]) { super(id) }

  public static builtinMetastructs = {
    Vector: Metastruct.add("dc5c7c67-6dea-4f25-9acc-687627bdaf10", [
      { name: "x", type: Primitive.Number },
      { name: "y", type: Primitive.Number }
    ]),
    SequenceOutput: Metastruct.add("e3d531d3-31ce-491c-9389-d806a6138892", [
      { name: "t0", type: Primitive.Number },
      { name: "t1", type: Primitive.Number },
      { name: "t2", type: Primitive.Number }
    ])
  };

  public static fromId(metastructId: string): Metastruct {
    for (const metastruct of Object.values(this.builtinMetastructs)) {
      if (metastruct.id === metastructId) return metastruct;
    }
    console.assert(false);
    return undefined as any;
  }

  private static add(id: string, members: Member[]): Metastruct {
    const metastruct = new Metastruct(id, members);
    Type.types.add(metastruct);
    return metastruct;
  }
}
