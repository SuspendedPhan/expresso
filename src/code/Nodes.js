const Nodes = {
  Number: class Number {
    constructor(value) {
      console.assert(value != null);
      this.value = value;
    }
    eval() {
      return this.value;
    }
    toString() {
      return this.value.toString();
    }
  },

  Add: class Add {
    constructor(a, b) {
      this.children = [a, b];
      this.name = "add";
    }
    eval() {
      return this.children[0].eval() + this.children[1].eval();
    }
    toString() {
      return `add(${this.children[0].toString()}, ${this.children[1].toString()})`;
    }
  },
  
  Lerp: {
    eval: ([start, end, t]) => t * (start.eval() + end.eval()),
  },
};

export default Nodes;
