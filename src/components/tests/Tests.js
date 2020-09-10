import * as chai from 'chai'
import Node from '../../code/Node';
import Metanodes, { MetanodesByName } from '../../code/Metanodes';
import Actions from '../../code/Actions';
import Gets from '../../code/Gets';
import Functions from '../../code/Functions';
import { StoreMaker } from '../../code/Store';
import wu from 'wu';
import { describe, it, AssertionError } from './TestRunner';
import * as TestRunner from './TestRunner';

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
  it('nested add', () => {
    // expect({ a: 2, c: 4}).to.deep.equal({ a: 2, c: 3});
    const store = { parentByNode: new Map() };
    
    // circle -> radius -> number
    const circle = Actions.addEntity(store, 'circle');
    const radius = Actions.addProperty(store, circle, 'radius');
    Actions.replaceNode(store, radius.children[0], makeNumber(5));

    expect(store.parentByNode.get(radius.children[0])).to.equal(radius);
    expect(store.parentByNode.size).to.equal(2);
    
    // circle -> radius -> add -> number | number
    Actions.replaceNode(store, radius.children[0], makeAdd());
    expect(store.parentByNode.get(radius.children[0])).to.equal(radius);
    expect(store.parentByNode.size).to.equal(4);
    
    // circle -> radius -> add -> number | add(number, number)
    Actions.replaceNode(store, radius.children[0].children[0], makeAdd());
    expect(store.parentByNode.get(radius.children[0])).to.equal(radius);
    expect(store.parentByNode.get(radius.children[0].children[0])).to.equal(radius.children[0]);
    expect(store.parentByNode.size).to.equal(6);
    expect(radius.metaname).to.equal('Variable');
    expect(radius.children[0].metaname).to.equal('Add');
    expect(radius.children[0].children[0].metaname).to.equal('Add');
    expect(radius.children[0].children[1].metaname).to.equal('Number');
    expect(radius.children[0].children[0].children[0].metaname).to.equal('Number');
    
    // circle -> radius -> number
    Actions.replaceNode(store, radius.children[0], makeNumber());
    expect(store.parentByNode.size).to.equal(2);
    expect(radius.metaname).to.equal('Variable');
    expect(radius.children[0].metaname).to.equal('Number');
    
    expect(() => Actions.replaceNode(store, radius, makeNumber())).to.throw();
  })

  it('reassign variable', () => {
    const store = { parentByNode: new Map() };
    const circle = Actions.addEntity(store, 'circle');
    
    const radius = Actions.addProperty(store, circle, 'radius');
    const x = Actions.addProperty(store, circle, 'x');
    const y = Actions.addProperty(store, circle, 'y');

    expect(Node.eval(radius)).to.equal(0);
    expect(Node.eval(x)).to.equal(0);
    expect(Node.eval(y)).to.equal(0);

    Actions.replaceNode(store, radius.children[0], makeNumber(5));
    Actions.replaceNode(store, x.children[0], makeNumber(7));
    Actions.replaceNode(store, y.children[0], makeNumber(9));
    
    expect(Node.eval(radius)).to.equal(5);
    expect(Node.eval(x)).to.equal(7);
    expect(Node.eval(y)).to.equal(9);
    
    // x = radius
    Actions.replaceNode(store, x.children[0], makeReference(radius));

    expect(Node.eval(radius)).to.equal(5);
    expect(Node.eval(x)).to.equal(5);
    expect(Node.eval(y)).to.equal(9);

    // x = y
    Actions.replaceNode(store, x.children[0], makeReference(y));

    expect(Node.eval(radius)).to.equal(5);
    expect(Node.eval(x)).to.equal(9);
    expect(Node.eval(y)).to.equal(9);

    // y = 2
    Actions.replaceNode(store, y.children[0], makeNumber(2));
    
    expect(Node.eval(radius)).to.equal(5);
    expect(Node.eval(x)).to.equal(2);
    expect(Node.eval(y)).to.equal(2);
    
    // x = 3
    Actions.replaceNode(store, x.children[0], makeNumber(3));

    expect(Node.eval(radius)).to.equal(5);
    expect(Node.eval(x)).to.equal(3);
    expect(Node.eval(y)).to.equal(2);
  })

  it('new replaceNode API', () => {
    const store = { parentByNode: new Map() };
    const circle = Actions.addEntity(store, 'circle');
    Actions.addProperty(store, circle, 'radius');
    Actions.addProperty(store, circle, 'x');

    Actions.replaceNode(
      store,
      Gets.property(circle, 'x').children[0],
      MetanodesByName.get('Number'),
      [5]);

    expect(Node.eval(Gets.property(circle, 'x'))).to.equal(5);

    Actions.replaceNode(
      store,
      Gets.property(circle, 'radius').children[0],
      MetanodesByName.get('Reference'),
      [Gets.property(circle, 'x')]);

    expect(Node.eval(Gets.property(circle, 'radius'))).to.equal(5);
  })

  it('filterprops', () => {
    const store = { parentByNode: new Map() };
    Actions.addEntity(store, 'circle');
    const circle = Gets.entity(store, 'circle');
    Actions.addProperty(store, circle, 'radius');
    const radius = Gets.property(circle, 'radius');
    const actual = Functions.filterProps(radius, 'id', 'metaname');
    const expected = {
      id: actual.id,
      metaname: 'Variable',
    };
    expect(actual).to.deep.equal(expected);
    expect(actual.id).to.not.equal(undefined);
  })

  it('nodepicks', () => {
    return;
    const store = { parentByNode: new Map() };
    Actions.addEntity(store, 'circle');
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
    const store = { parentByNode: new Map() };
    Actions.addEntity(store, 'circle');
    const circle = Gets.entity(store, 'circle');
    Actions.addProperty(store, circle, 'radius');

    const name = Gets.propertyName(store, Gets.property(circle, 'radius'));
    expect(name).to.equal('radius');
  })

  it('properties', () => {
    const store = { parentByNode: new Map() };
    const circle = Actions.addEntity(store, 'circle');
    const radius = Actions.addEditableProperty(store, circle, 'radius');
    const x = Actions.addEditableProperty(store, circle, 'x');
    const y = Actions.addEditableProperty(store, circle, 'y');
    const cloneNumber = Actions.addComputedProperty(store, circle, 'cloneNumber');

    expect(Gets.editableProperties(circle)).to.deep.equal({ radius, x, y });
    expect(Gets.computedProperties(circle)).to.deep.equal({cloneNumber});
    expect(Gets.properties(circle)).to.deep.equal({ radius, x, y, cloneNumber });
  })

  it('render', () => {
    const store = StoreMaker.make();
    const circle = Actions.addEntity(store, 'circle');
    const x = Actions.addProperty(store, circle, 'x');
    const clones = Actions.addProperty(store, circle, 'clones');
    const cloneNumber = Actions.addComputedProperty(store, circle, 'cloneNumber');
    const cloneNumber01 = Actions.addComputedProperty(store, circle, 'cloneNumber01');
    Actions.assignVariable(store, clones, MetanodesByName.get('Number'), [3]);

    expect(Actions.eval(store, x)).to.equal(0);  // addProperty
    expect(Actions.eval(store, cloneNumber)).to.equal(0);  // addComputed
    expect(Actions.eval(store, clones)).to.equal(3);  // assignVariable
    
    const add = Actions.assignVariable(store, x, MetanodesByName.get('Add'), []);
    Actions.replaceNode(store, add.children[0], MetanodesByName.get('Reference'), [cloneNumber]);
    Actions.replaceNode(store, add.children[1], MetanodesByName.get('Number'), [3]);
    
    const expected = [
      { x: 3 },
      { x: 4 },
      { x: 5 },
    ];
    const actual = Array.from(Actions.computeRenderCommands(store, circle));
    expect(actual).to.deep.equal(expected);
  })

  it('assign variable by value', () => {
    expect(true).to.equal(true);
    const store = StoreMaker.make();
    const circle = Actions.addEntity(store, 'circle');
    const storeWidth = Actions.addComputedProperty(store, circle, 'width');
    const storeHeight = Actions.addComputedProperty(store, circle, 'height');
    Actions.assignNumberToVariable(store, storeWidth, 10);
    Actions.assignNumberToVariable(store, storeHeight, 20);
    expect(Actions.eval(store, storeWidth)).to.equal(10);
    expect(Actions.eval(store, storeHeight)).to.equal(20);
  })

  it('clonenumber01', () => {
    const store = StoreMaker.make();
    const circle = Actions.addEntity(store, 'circle');
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
    // references
    // functions
    
    // x = add(2, add(5, 3))
    // y = x

    const store = StoreMaker.make();
    const circle = Actions.addEntity(store, 'circle');
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