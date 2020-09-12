import * as Entity from './Entity';
import * as Node from './Node';
import * as Property from './Property';

export function makeStore() {
  return {};
}

function makeGets(root) {
  return {
  }
}

function makeActions(root) {
  return {
  }
}

export function make() {
  const root = {};
  root.store = makeStore(root);
  root.gets = makeGets(root);
  root.actions = makeActions();
  root.entity = Entity.make(root);
  root.property = Property.make(root);
  root.node = Node.make(root);
  return root;
}

const root = make();
export default root;
