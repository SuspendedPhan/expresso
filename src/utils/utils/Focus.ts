import type { ExObject } from "src/ex-object/ExObject";

export class FocusBase {
  public type = typeof this;
  public isEditing: boolean = false;
}

export namespace ExObjectFocus {
  export interface Data {
    exObject: ExObject;
    isEditing: boolean;
  }

  export class Base extends FocusBase {
    public exObject: ExObject;

    constructor(data: Data) {
      super();
      this.exObject = data.exObject;
      this.isEditing = data.isEditing;
    }
  }

  export class Name extends Base {
    constructor(data: Data) {
      super(data);
    }
  }

  export class Component extends Base {
    constructor(data: Data) {
      super(data);
    }
  }
}
