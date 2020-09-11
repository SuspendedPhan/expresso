import * as Entity from './Entity';
import * as Node from './Node';
import * as Property from './Property';

export function makeStore() {
  return {};
}

function makeGets(root, store) {
  return {
  }
}

function makeActions(root, store) {
  return {
  }
}

export function make(root) {
  const store = makeStore();
  return {
    store,
    gets: makeGets(root, store),
    actions: makeActions(root, store),

    entity: Entity.make(),
    property: Property.make(),
    node: Node.make(),
  };
}

const root = make();
export default root;
