import Metanodes from "../code/Metanodes";
import Actions from "../code/Actions";
import Gets from "../code/Gets";
import * as Entity from './Entity';

const { Number } = Metanodes;

export class StoreMaker {
  static make() {
    return {
      parentIdByNodeId: {},
      storeObjectById: {},
      cursorPosition: null,
      tokenPickingInProgress: false,
      entities: [],
    };
  }
}

const store = StoreMaker.make();
const circle = Entity.addEntity(store, 'circle');
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


