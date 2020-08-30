import Metanodes from "./Metanodes";
import Actions from "./Actions";
import Gets from "./Gets";

const { Number } = Metanodes;

export class StoreMaker {
  static make() {
    return {
      parentByNode: new Map(),
      pointedNode: null,
    };
  }
}

const store = StoreMaker.make();

const circle = Actions.addEntity(store, 'circle');
const clones = Actions.addProperty(store, circle, 'clones');
const radius = Actions.addProperty(store, circle, 'radius');
Actions.addProperty(store, circle, 'x');
Actions.addProperty(store, circle, 'y');
Actions.addComputedProperty(store, circle, 'cloneNumber');
Actions.addComputedProperty(store, circle, 'cloneNumber01');
Actions.assignNumberToVariable(store, clones, 1);
Actions.assignNumberToVariable(store, radius, 10);

const Store = store;
export default Store;
window.store = Store;


