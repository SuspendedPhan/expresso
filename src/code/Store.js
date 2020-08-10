import Nodes from "./Nodes";

const { Number, Add } = Nodes;

const Store = {
  radius: new Add(new Number(10), new Add(new Number(1), new Number(2))),
};

export default Store;
window.store = Store;
