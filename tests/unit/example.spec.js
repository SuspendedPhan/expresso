import { expect } from 'chai'
import Node from '../../src/code/Node';
import Metanodes, { MetanodesByName } from '../../src/code/Metanodes';
import Actions from '../../src/code/Actions';
import Gets from '../../src/code/Gets';
import Functions from '../../src/code/Functions';
import { StoreMaker } from '../../src/code/Store';
import wu from 'wu';

function storeEquals(storeA, storeB) {
  // for (const entityA of Gets.entities(storeA)) {
  //   const entityB = Gets.entities(storeB);
  //   for (const propertyA of Gets.properties()) {
      
  //   }
  // }
}

function makeNumber(value) {
  const num = Node.make(MetanodesByName.get('Number'));
  num.value = value;
  // return num;
}

function makeReference(target) {
  expect(target).to.not.be.null;
  const answer = Node.make(MetanodesByName.get('Reference'));
  answer.target = target;
  // return answer;
}

describe('HelloWorld.vue', () => {
  it('reassign variable', () => {
    // return;
    const store = { parentByNode: new Map() };
    const circle = Actions.addEntity(store, 'circle');
    
    const radius = Actions.addProperty(store, circle, 'radius');
    const x = Actions.addProperty(store, circle, 'x');
    const y = Actions.addProperty(store, circle, 'y');

    expect(Node.eval(radius)).to.equal(0);
    expect(Node.eval(x)).to.equal(0);
    expect(Node.eval(y)).to.equal(0);

    Actions.replaceNode(store, radius.children[0], MetanodesByName.get('Number'), [5]);
    Actions.replaceNode(store, x.children[0], MetanodesByName.get('Number'), [7]);
    Actions.replaceNode(store, y.children[0], MetanodesByName.get('Number'), [9]);
    
    expect(Node.eval(radius)).to.equal(5);
    expect(Node.eval(x)).to.equal(7);
    expect(Node.eval(y)).to.equal(9);
    
    // x = radius
    Actions.replaceNode(store, x.children[0], MetanodesByName.get('Reference'), [radius]);

    expect(Node.eval(radius)).to.equal(5);
    expect(Node.eval(x)).to.equal(5);
    expect(Node.eval(y)).to.equal(9);

    // x = y
    Actions.replaceNode(store, x.children[0], MetanodesByName.get('Reference'), [y]);

    expect(Node.eval(radius)).to.equal(5);
    expect(Node.eval(x)).to.equal(9);
    expect(Node.eval(y)).to.equal(9);

    // y = 2
    Actions.replaceNode(store, y.children[0], MetanodesByName.get('Number'), [2]);
    
    expect(Node.eval(radius)).to.equal(5);
    expect(Node.eval(x)).to.equal(2);
    expect(Node.eval(y)).to.equal(2);
    
    // x = 3
    Actions.replaceNode(store, x.children[0], MetanodesByName.get('Number'), [3]);

    expect(Node.eval(radius)).to.equal(5);
    expect(Node.eval(x)).to.equal(3);
    expect(Node.eval(y)).to.equal(2);
  })

  it('new replaceNode API', () => {
    // return;
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
    // return;
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
    expect(actual.id).to.not.be.undefined;
  })

  it('nodepicks', () => {
    // return;
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
    // return;
    const store = { parentByNode: new Map() };
    Actions.addEntity(store, 'circle');
    const circle = Gets.entity(store, 'circle');
    Actions.addProperty(store, circle, 'radius');

    const name = Gets.propertyName(store, Gets.property(circle, 'radius'));
    expect(name).to.equal('radius');
  })

  it('properties', () => {
    // return;
    const store = { parentByNode: new Map() };
    Actions.addEntity(store, 'circle');
    const circle = Gets.entity(store, 'circle');
    const radius = Actions.addProperty(store, circle, 'radius');
    const x = Actions.addProperty(store, circle, 'x');
    const y = Actions.addProperty(store, circle, 'y');
    // const cloneNumber = Actions.addComputedProperty(store, circle, 'cloneNumber');

    const expected = { radius, x, y };
    expect(Gets.properties(circle)).to.deep.equal(expected);
    // expect(Gets.computedProperties(circle)).to.deep.equal([cloneNumber]);
  })

  it('render', () => {
    return;
    const store = StoreMaker.make();
    const circle = Actions.addEntity(store, 'circle');
    const x = Actions.addProperty(store, circle, 'x');
    const clones = Actions.addProperty(store, circle, 'clones');
    const cloneNumber = Actions.addComputedProperty(store, circle, 'cloneNumber');
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
    const actual = Array.from(Actions.computeRenderCommands(store, store.circle));
    expect(actual).to.deep.equal(expected);
  })

  it('assign variable by value', () => {
    // return;
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
    // return;
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
      // return children;
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
    expect(wu.some(() => true, traverse)).to.be.false;

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
    expect(wu.some(() => true, traverse)).to.be.false;
  })

  // it('serialization', () => {
  //   const store = StoreMaker.make();
  //   const store2 = StoreMaker.make();
  //   const serializedStore = Actions.serialize(store);
  //   Actions.deserialize(store2, serializedStore);
  //   storeEquals(store, store2);
  // })
})
