import * as chai from 'chai'
import Node from '../../code/Node';
import Metanodes, { MetanodesByName } from '../../code/Metanodes';
import Actions from '../../code/Actions';
import Gets from '../../code/Gets';
import Functions from '../../code/Functions';
import { RootStore }  from '../../store/Root';
import wu from 'wu';
import { describe, it, AssertionError } from './TestRunner';
import * as TestRunner from './TestRunner';
import * as Organism from '../../store/Organism';

function logAndRethrow(error) {
  const customError = Object.assign(new AssertionError(), {
    message: error.message,
    actual: error.actual,
    expected: error.expected,
  });
  console.error(customError);
  throw customError;
}

function expect(actual) {
  return {
    to: {
      equal: function (expected) {
        try {
          chai.assert.strictEqual(actual, expected);
        } catch (error) {
          logAndRethrow(error);
        }
      },
      deep: {
        equal: function (expected) {
          try {
            chai.assert.deepStrictEqual(actual, expected);
          } catch (error) {
            logAndRethrow(error);
          }
        }
      },
      throw: function () {
        try {
          chai.assert.throws(actual);
        } catch (error) {
          logAndRethrow(error);
        }
      },
      not: {
        equal: function (expected) {
          try {
            chai.assert.notStrictEqual(actual, expected);
          } catch (error) {
            logAndRethrow(error);
          }
        },
      }
    }
  };
}

TestRunner.clearStore();

describe('HelloWorld.vue', () => {
  it('organism', () => {
    const root = new RootStore();
    const organismStore = root.organismStore;
    const circle = organismStore.put('circle');
    const circle2 = organismStore.getFromName('circle');
    expect(circle).to.equal(circle2);
  })

  it('attribute', () => {
    const root = new RootStore();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const circle = organismStore.put('circle');
    const radius = attributeStore.putEditable(circle, 'radius');
  })

  it('nested add', () => {
    const root = new RootStore();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const nodeStore = root.nodeStore;
    const metafunStore = root.metafunStore;
    
    // circle -> radius -> number
    const circle = organismStore.put('circle');
    const radius = attributeStore.putEditable(circle, 'radius');
    const radiusRoot = attributeStore.getRootNode(radius);
    const radiusChild = nodeStore.putChild(radiusRoot, 0, nodeStore.addNumber(5));

    expect(nodeStore.getParent(radiusChild)).to.equal(radiusRoot);
    expect(nodeStore.getChild(radiusRoot, 0)).to.equal(radiusChild);
    expect(nodeStore.nodes.length === 2);
    
    // circle -> radius -> variable -> add -> number | number
    const add = nodeStore.addFun(metafunStore.getFromName('Add'));
    nodeStore.putChild(radiusRoot, 0, add);
    expect(() => nodeStore.putChild(radiusRoot, 1, add)).to.throw();

    expect(nodeStore.getChild(radiusRoot, 0).metaname).to.equal('Function');
    expect(nodeStore.nodes.length).to.equal(4);

    const add2 = nodeStore.addFun(metafunStore.getFromName('Add'));
    nodeStore.putChild(add, 0, add2);

    expect(nodeStore.nodes.length).to.equal(6);
  })

  it('reassign variable', () => {
    const root = new RootStore();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const nodeStore = root.nodeStore;

    const circle = organismStore.put('circle');
    const radius = attributeStore.getRootNode(attributeStore.putEditable(circle, 'radius'));
    const x = attributeStore.getRootNode(attributeStore.putEditable(circle, 'x'));
    const y = attributeStore.getRootNode(attributeStore.putEditable(circle, 'y'));
    
    expect(radius.eval()).to.equal(0);
    expect(x.eval()).to.equal(0);
    expect(y.eval()).to.equal(0);

    nodeStore.putChild(radius, 0, nodeStore.addNumber(5));
    nodeStore.putChild(x, 0, nodeStore.addNumber(7));
    nodeStore.putChild(y, 0, nodeStore.addNumber(9));
    
    expect(radius.eval()).to.equal(5);
    expect(x.eval()).to.equal(7);
    expect(y.eval()).to.equal(9);

    // x = radius
    nodeStore.putChild(x, 0, nodeStore.addReference(radius));

    expect(radius.eval()).to.equal(5);
    expect(x.eval()).to.equal(5);
    expect(y.eval()).to.equal(9);

    // x = y
    nodeStore.putChild(x, 0, nodeStore.addReference(y));

    expect(radius.eval()).to.equal(5);
    expect(x.eval()).to.equal(9);
    expect(y.eval()).to.equal(9);

    // y = 2
    nodeStore.putChild(y, 0, nodeStore.addNumber(2));
    
    expect(radius.eval()).to.equal(5);
    expect(x.eval()).to.equal(2);
    expect(y.eval()).to.equal(2);
    
    // x = 3
    nodeStore.putChild(x, 0, nodeStore.addNumber(3));

    expect(radius.eval()).to.equal(5);
    expect(x.eval()).to.equal(3);
    expect(y.eval()).to.equal(2);
  })

  it('computeRenderCommands', () => {
    const root = new RootStore();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const nodeStore = root.nodeStore;
    const metafunStore = root.metafunStore;

    const circle = organismStore.put('circle');
    const x = attributeStore.getRootNode(attributeStore.putEditable(circle, 'x'));
    const clones = attributeStore.getRootNode(attributeStore.putEditable(circle, 'clones'));
    const cloneNumber = attributeStore.getRootNode(attributeStore.putEmergent(circle, 'cloneNumber'));

    nodeStore.putChild(clones, 0, nodeStore.addNumber(3));

    expect(x.eval()).to.equal(0);  // addProperty
    expect(cloneNumber.eval()).to.equal(0);  // addComputed
    expect(clones.eval()).to.equal(3);  // assignVariable
    
    const add = nodeStore.putChild(x, 0, nodeStore.addFun(metafunStore.getFromName('Add')));
    nodeStore.putChild(add, 0, nodeStore.addReference(cloneNumber));
    nodeStore.putChild(add, 1, nodeStore.addNumber(3));
    
    const expected = [
      { x: 3 },
      { x: 4 },
      { x: 5 },
    ];
    const actual = Array.from(root.computeRenderCommands());
    expect(actual).to.deep.equal(expected);
  })

  it('getReplacementSuggestions', () => {
    return;
    const store = StoreMaker.make();
    Entity.addEntity(store, 'circle');
    const circle = Gets.entity(store, 'circle');
    const radius = Actions.addProperty(store, circle, 'radius');
    const x = Actions.addProperty(store, circle, 'x');
    const y = Actions.addProperty(store, circle, 'y');
    const cloneNumber = Actions.addComputedProperty(store, circle, 'cloneNumber');

    var expected;
    var actual;

    actual = Gets.nodePicks(store, '23', Gets.property(circle, 'radius'));
    expected = [
      { metanode: MetanodesByName.get('Number'), args: [23], text: '23' }
    ];
    expect(Array.from(actual)).to.deep.equal(expected);
    
    // -- Test --
    actual = Gets.nodePicks(store, '', Gets.property(circle, 'radius'));
    expected = [
      { metanode: MetanodesByName.get('Reference'), args: [x], text: 'x' },
      { metanode: MetanodesByName.get('Reference'), args: [y], text: 'y' },
      { metanode: MetanodesByName.get('Reference'), args: [cloneNumber], text: 'cloneNumber' },
      { metanode: MetanodesByName.get('Add'), args: [], text: 'Add' },
    ];
    actual = Array.from(actual).map(result => ({
      ...result,
      args: result.args.filter(arg => Functions.filterProps(arg, 'id', 'metaname'))
    }));
    expected = Array.from(expected).map(result => ({
      ...result,
      args: result.args.filter(arg => Functions.filterProps(arg, 'id', 'metaname'))
    }));
    expect(Array.from(actual)).to.deep.equal(expected);

    // -- Test --
    actual = Gets.nodePicks(store, 'c', Gets.property(circle, 'radius'));
    expected = [
      { metanode: MetanodesByName.get('Reference'), args: [cloneNumber], text: 'cloneNumber' },
    ];
    actual = Array.from(actual);
    actual = actual.map(result => ({
      ...result,
      args: result.args.filter(arg => Functions.filterProps(arg, 'id', 'metaname'))
    }));
    expected = Array.from(expected).map(result => ({
      ...result,
      args: result.args.filter(arg => Functions.filterProps(arg, 'id', 'metaname'))
    }));
    expect(Array.from(actual)).to.deep.equal(expected);
  })

  it('propname', () => {
    return;
    const store = StoreMaker.make();
    Entity.addEntity(store, 'circle');
    const circle = Gets.entity(store, 'circle');
    Actions.addProperty(store, circle, 'radius');

    const name = Gets.propertyName(store, Gets.property(circle, 'radius'));
    expect(name).to.equal('radius');
  })

  it('properties', () => {
    return;
    const store = StoreMaker.make();
    const circle = Entity.addEntity(store, 'circle');
    const radius = Actions.addEditableProperty(store, circle, 'radius');
    const x = Actions.addEditableProperty(store, circle, 'x');
    const y = Actions.addEditableProperty(store, circle, 'y');
    const cloneNumber = Actions.addComputedProperty(store, circle, 'cloneNumber');

    expect(Gets.editableProperties(circle)).to.deep.equal({ radius, x, y });
    expect(Gets.computedProperties(circle)).to.deep.equal({cloneNumber});
    expect(Gets.properties(circle)).to.deep.equal({ radius, x, y, cloneNumber });
  })

  it('clonenumber01', () => {
    return;
    const store = StoreMaker.make();
    const circle = Entity.addEntity(store, 'circle');
    const clones = Actions.addProperty(store, circle, 'clones');
    const radius = Actions.addProperty(store, circle, 'radius');
    Actions.addComputedProperty(store, circle, 'cloneNumber');
    const cloneNumber01 = Actions.addComputedProperty(store, circle, 'cloneNumber01');
    Actions.assignNumberToVariable(store, clones, 1);
    Actions.assignVariable(store, radius, MetanodesByName.get('Reference'), [cloneNumber01]);
    
    let actual = Array.from(Actions.computeRenderCommands(store, store.circle));
    let expected = [
      { radius: 0 },
    ];
    expect(actual).to.deep.equal(expected);


    Actions.assignNumberToVariable(store, clones, 3);
    actual = Array.from(Actions.computeRenderCommands(store, store.circle));
    expected = [
      { radius: 0 },
      { radius: .5 },
      { radius: 1 },
    ];
    expect(actual).to.deep.equal(expected);
  })

  it('traverseLeft', () => {
    return;
    const tree = {
      a: {
        b: {
          c: {},
          d: {},
        },
        e: {
          f: {},
          g: {
            i: {
              j: {},
              k: {},
            },
            l: {}
          },
          h: {},
        }
      }
    };
    const childrenGetter = (node) => {
      const children = Array.from(wu.values(node));
      children.sort();
      return children;
    };
    const parents = new Map();
    const setParents = (node) => {
      const children = childrenGetter(node);
      for (const child of children) {
        parents.set(child, node);
        setParents(child);
      }
    };
    setParents(tree.a);

    expect(parents.get(tree.a.b)).to.equal(tree.a);
    expect(parents.get(tree.a.e.g.i.j)).to.equal(tree.a.e.g.i);

    const parentGetter = (node) => parents.get(node);
    
    let traverse;
    let actual;
    
    traverse = Functions.traverseLeft(tree.a.e.g, parentGetter, childrenGetter);
    actual = traverse.next().value;
    expect(actual).to.equal(tree.a.e.f);

    traverse = Functions.traverseLeft(tree.a.e.g.i.k, parentGetter, childrenGetter);
    actual = traverse.next().value;
    expect(actual).to.equal(tree.a.e.g.i.j);

    traverse = Functions.traverseLeft(tree.a.b.c, parentGetter, childrenGetter);
    actual = traverse.next().value;
    expect(actual).to.equal(tree.a.b);

    traverse = Functions.traverseLeft(tree.a, parentGetter, childrenGetter);
    expect(wu.some(() => true, traverse)).to.equal(false);

    // -- right --

    traverse = Functions.traverseRight(tree.a.e.g, parentGetter, childrenGetter);
    actual = traverse.next().value;
    expect(actual).to.equal(tree.a.e.g.i);

    traverse = Functions.traverseRight(tree.a.e.g.i.k, parentGetter, childrenGetter);
    actual = traverse.next().value;
    expect(actual).to.equal(tree.a.e.g.l);

    traverse = Functions.traverseRight(tree.a.b, parentGetter, childrenGetter);
    actual = traverse.next().value;
    expect(actual).to.equal(tree.a.b.c);

    traverse = Functions.traverseRight(tree.a.e.h, parentGetter, childrenGetter);
    expect(wu.some(() => true, traverse)).to.equal(false);
  })

  it('serialize', () => {
    return;
    // references
    // functions
    
    // x = add(2, add(5, 3))
    // y = x

    const store = StoreMaker.make();
    const circle = Entity.addEntity(store, 'circle');
    const x = Actions.addEditableProperty(store, circle, 'x');
    const y = Actions.addEditableProperty(store, circle, 'y');
    const addNode = Actions.assignVariable(store, x, MetanodesByName.get('Add'), []);
    Actions.replaceNode(store, addNode.children[0], MetanodesByName.get('Number'), [2]);
    const addNode2 = Actions.replaceNode(store, addNode.children[1], MetanodesByName.get('Add'), []);
    Actions.replaceNode(store, addNode2.children[0], MetanodesByName.get('Number'), [5]);
    Actions.replaceNode(store, addNode2.children[1], MetanodesByName.get('Number'), [3]);

    Actions.assignVariable(store, y, MetanodesByName.get('Reference'), [x]);

    expect(Actions.eval(store, Gets.editableProperty(circle, 'x'))).to.equal(10);
    expect(Actions.eval(store, Gets.editableProperty(circle, 'y'))).to.equal(10);

    const text = Functions.serialize(store);
    const store2 = Functions.deserialize(text);

    expect(Actions.eval(store2, Gets.editableProperty(circle, 'x'))).to.equal(10);
    expect(Actions.eval(store2, Gets.editableProperty(circle, 'y'))).to.equal(10);

    Actions.assignVariable(store, Gets.editableProperty(circle, 'x'), MetanodesByName.get('Number'), [1]);
    expect(Actions.eval(store2, Gets.editableProperty(circle, 'x'))).to.equal(1);
  })
})

function makeNumber(value) {
  const num = Node.make(MetanodesByName.get('Number'));
  num.value = value;
  return num;
}

function makeReference(target) {
  expect(target).to.not.equal(null);
  const answer = Node.make(MetanodesByName.get('Reference'));
  answer.target = target;
  return answer;
}

function makeAdd() {
  return Node.make(MetanodesByName.get('Add'));
}