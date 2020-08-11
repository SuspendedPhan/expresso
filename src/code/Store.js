import MetaNodes from "./MetaNodes";
const { Number } = MetaNodes;

const Store = { circle: {} }
Store.circle.radius = Number.make(Store.circle, 10);

export default Store;
window.store = Store;
