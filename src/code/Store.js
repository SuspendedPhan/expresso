import Metanodes from "./Metanodes";
import Actions from "./Actions";
import Gets from "./Gets";

const { Number } = Metanodes;

export class StoreMaker {
  static make() {
    return { parentByNode: new Map() };
  }
}

const store = StoreMaker.make();

const circle = Actions.addEntity(store, 'circle');
Actions.addProperty(store, circle, 'clones');
Actions.addProperty(store, circle, 'radius');
Actions.addProperty(store, circle, 'x');
Actions.addProperty(store, circle, 'y');

const Store = store;
export default Store;
window.store = Store;


