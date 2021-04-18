export class Ast {
  public static clones: i32;
  public static getClones(): i32 {
    return this.clones;
  }
  public static setClones(value: i32): void {
    this.clones = value;
    EvalOutput.radiuss = new Float32Array(value);
  }

  public static eval(startIndex: i32, postEndIndex: i32): void {
    for (let i = startIndex; i < postEndIndex; i++) {
      EvalOutput.setRadius(i, <f32>i * 50);
    }
  }
}

export class EvalOutput {
  public static radiuss: Float32Array;
  public static getRadius(cloneNumber: i32): f32 {
    return this.radiuss[cloneNumber];
  }
  public static setRadius(cloneNumber: i32, value: f32): void {
    this.radiuss[cloneNumber] = value;
  }
}