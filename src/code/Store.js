import Metanodes from "./Metanodes";
import Actions from "./Actions";
import Gets from "./Gets";

const { Number } = Metanodes;

const Store = { parentByNode: new Map() }
const store = Store;

const circle = Actions.addEntity(Store, 'circle');
Actions.addProperty(store, circle, 'clones');
Actions.addProperty(store, circle, 'radius');
Actions.addProperty(store, circle, 'x');
Actions.addProperty(store, circle, 'y');

export default Store;
window.store = Store;
