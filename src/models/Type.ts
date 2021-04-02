import Collection from "@/code/Collection";

export default class Type {
  public constructor(public id: string) {}

  public equals(other: Type) {
    return this.id === other.id;
  }

  public static deserialize() {

  }

  public static types = new Collection([], ['id']);

  static fromId(id: string): Type {
    return this.types.getUnique('id', id) as any;
  }
}

export class Primitive extends Type {
  public constructor(id: string) {
    super(id);
  }

  public static Number = Primitive.add('4422149a-e512-485c-af66-95baf76eb71c');
  public static Undetermined = Primitive.add('13c25a71-1769-49a1-9b23-0eb2083517de');

  private static add(id: string) {
    const primitive = new Primitive(id);
    Type.types.add(primitive);
    return primitive;
  }
}
