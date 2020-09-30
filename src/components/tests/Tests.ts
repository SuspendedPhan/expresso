import * as chai from 'chai'
import Functions from '../../code/Functions';
import { RenderShape, Root }  from '../../store/Root';
import wu from 'wu';
import { describe, it, AssertionError } from './TestRunner';
import * as TestRunner from './TestRunner';
import threelevels from './data/threelevels.json';
import { PenPositionRelation } from '@/store/Pen';

// npm run md -- -o C:\Users\Yaktori\Documents\GitHub\expresso\src\components\tests\data\threelevels.json C:\Users\Yaktori\Documents\GitHub\expresso\src\components\tests\data\threelevels.md


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
        },
        include: function(expected) {
          try {
            chai.assert.deepOwnInclude(actual, expected);
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
    const root = new Root();
    const organismStore = root.organismStore;
    const circle = organismStore.put('circle');
    const circle2 = organismStore.getFromName('circle');
    expect(circle).to.equal(circle2);
  })

  it('attribute', () => {
    const root = new Root();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const circle = organismStore.put('circle');
    const radius = attributeStore.putEditable(circle, 'radius');
  })

  it('nested add', () => {
    return;
    const root = new Root();
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
    radiusRoot.eval();

    expect(nodeStore.nodes.length).to.equal(6);
  })

  it('reassign variable', () => {
    const root = new Root();
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
    return;
    const root = new Root();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const nodeStore = root.nodeStore;
    const metafunStore = root.metafunStore;

    const circle = organismStore.spawn();
    const x = attributeStore.getRootNodeFromName(circle, 'x');
    const clones = attributeStore.getRootNodeFromName(circle, 'clones');
    const cloneNumber = attributeStore.getRootNodeFromName(circle, 'cloneNumber');

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
    const actual = wu(root.computeRenderCommands()).map(row => ({ x: row.x })).toArray();
    expect(actual).to.deep.equal(expected);
  })

  it('getReplacementSuggestions', () => {
    const root = new Root();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const nodeStore = root.nodeStore;
    const penStore = root.penStore;
    const metafunStore = root.metafunStore;
    metafunStore.metafuns = [
      {
        name: 'Add',
        paramCount: 2,
        eval: (a, b) => a.eval() + b.eval(),
      },
    ];

    root.organismCollection.rootOrganism = organismStore.putFromMetaWithoutAttributes('root', root.metaorganismCollection.getFromName('SuperOrganism'));
    const circle = organismStore.addChild(organismStore.getRoot(), organismStore.putSuperOrganismWithoutAttributes('circle'));
    const x = attributeStore.getRootNode(attributeStore.putEditable(circle, 'x'));
    const y = attributeStore.getRootNode(attributeStore.putEditable(circle, 'y'));
    const clones = attributeStore.getRootNode(attributeStore.putEditable(circle, 'clones'));
    const cloneNumber = attributeStore.getRootNode(attributeStore.putEmergent(circle, 'cloneNumber'));

    let expected;
    let actual;
    let suggestions;
    
    penStore.setPointedNode(nodeStore.getChild(y, 0));
    penStore.setPointedNode(nodeStore.getChild(x, 0));

    // --- number ---

    penStore.setIsQuerying(true);
    penStore.setQuery('52');
    suggestions = penStore.getReplacementSuggestions();

    expected = ['52'];
    actual = suggestions.map(row => row.text).toArray();
    expect(actual).to.deep.equal(expected);

    suggestions = penStore.getReplacementSuggestions();
    penStore.commitSuggestion(suggestions.take(1).toArray()[0]);
    expect(x.eval()).to.equal(52);
    
    // --- empty query ---
    // should list all, but skip x

    penStore.setIsQuerying(true);
    penStore.setQuery('');
    suggestions = penStore.getReplacementSuggestions();
    expected = ['circle.y', 'circle.clones', 'circle.cloneNumber', 'Add'];
    actual = suggestions.map(row => row.text).toArray();
    expect(actual).to.deep.equal(expected);
    
    // --- commit function ---

    suggestions = penStore.getReplacementSuggestions();
    penStore.commitSuggestion(suggestions.drop(3).toArray()[0]);
    expect(x.eval()).to.equal(0);

    // --- non empty query ---

    penStore.setIsQuerying(true);
    penStore.setQuery('lon');
    suggestions = penStore.getReplacementSuggestions();
    expected = ['circle.clones', 'circle.cloneNumber'];
    actual = suggestions.map(row => row.text).toArray();
    expect(actual).to.deep.equal(expected);
    
    // --- commit reference ---
    // --- new pointed node ---
    // --- no more querying ---
    
    suggestions = penStore.getReplacementSuggestions();
    const numberNode = nodeStore.putChild(clones, 0, nodeStore.addNumber(3));
    penStore.commitSuggestion(suggestions.take(1).toArray()[0]);
    expect(x.eval()).to.equal(3);
    // expect(penStore.pointedNode).to.equal(nodeStore.getChild(x, 0));
    expect(penStore.getIsQuerying()).to.equal(false);

  })

  it('isSubsequence', () => {
    let actual;
    
    actual = Functions.isSubsequence('cne', 'clones');
    expect(actual).to.equal(true);

    actual = Functions.isSubsequence('cneq', 'clones');
    expect(actual).to.equal(false);

    actual = Functions.isSubsequence('clones', 'clon');
    expect(actual).to.equal(false);

    actual = Functions.isSubsequence('clones', 'clones');
    expect(actual).to.equal(true);

    actual = Functions.isSubsequence('', 'clones');
    expect(actual).to.equal(true);

    actual = Functions.isSubsequence('x', '');
    expect(actual).to.equal(false);
  })

  it('traverseLeft', () => {
    // return;
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

  it('assign number', () => {
    const root = new Root();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const nodeStore = root.nodeStore;
    const penStore = root.penStore;
    const metafunStore = root.metafunStore;

    const circle = organismStore.put('circle');
    const x = attributeStore.putEditable(circle, 'x');
    const cloneNumber = attributeStore.putEmergent(circle, 'cloneNumber');
    attributeStore.assignNumber(x, 5);
    attributeStore.assignNumber(cloneNumber, 10);
    expect(attributeStore.getEvaled(x)).to.equal(5);
    expect(attributeStore.getEvaled(cloneNumber)).to.equal(10);
  })

  it('serialize', () => {
    // references
    // functions
    
    // x = add(2, add(5, 3))
    // y = x

    const root = new Root();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const nodeStore = root.nodeStore;
    const penStore = root.penStore;
    const metafunStore = root.metafunStore;

    const circle = organismStore.putFromMeta('circle', root.metaorganismCollection.getFromName('Circle'));
    const x = attributeStore.getRootNodeFromName(circle, 'x');
    const y = attributeStore.getRootNodeFromName(circle, 'y');

    const addNode = nodeStore.addFun(metafunStore.getFromName('Add'));
    const addNode2 = nodeStore.addFun(metafunStore.getFromName('Add'));
    nodeStore.putChild(x, 0, addNode);
    nodeStore.putChild(addNode, 0, nodeStore.addNumber(2));
    nodeStore.putChild(addNode, 1, addNode2);
    nodeStore.putChild(addNode2, 0, nodeStore.addNumber(5));
    nodeStore.putChild(addNode2, 1, nodeStore.addNumber(3));
    nodeStore.putChild(y, 0, nodeStore.addReference(x));

    expect(x.eval()).to.equal(10);
    expect(y.eval()).to.equal(10);

    const text = root.getSerialized();
    const store2 = root.deserialize(text);

    expect(x.eval()).to.equal(10);
    expect(y.eval()).to.equal(10);

    nodeStore.putChild(x, 0, nodeStore.addNumber(1));
    expect(x.eval()).to.equal(1);
  })

  it('pluck', () => {
    let actual;
    let expected;

    actual = Functions.pluck({
      a: 2,
      b: 3,
      c: 5,
    }, ['a', 'b']);
    expected = {
      a: 2,
      b: 3,
    };
    expect(actual).to.deep.equal(expected);

    expect(() => Functions.pluck({
    }, ['a', 'b'])).to.throw();

    actual = Functions.pluck({
      a: 2,
      b: 3,
      c: 5,
    }, []);
    expected = {
    };
    expect(actual).to.deep.equal(expected);

    actual = Functions.pluck({
      a: 2,
      b: 3,
      c: 5,
    }, ['a', 'b', 'c']);
    expected = {
      a: 2,
      b: 3,
      c: 5,
    };
    expect(actual).to.deep.equal(expected);
  })

  it('getAttributesForOrganism', () => {
    const root = new Root();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const nodeStore = root.nodeStore;
    const penStore = root.penStore;
    const metafunStore = root.metafunStore;

    const circle = organismStore.put('circle');
    const x = attributeStore.putEditable(circle, 'x');
    const y = attributeStore.putEditable(circle, 'y');
    const cloneNumber = attributeStore.putEmergent(circle, 'cloneNumber');

    const actual = Array.from(attributeStore.getAttributesForOrganism(circle));
    const expected = [x, y, cloneNumber];
    expect(actual).to.deep.equal(expected);
  })
  
  it('organs', () => {
    const root = new Root();
    const attributeCollection = root.attributeCollection;
    const organismCollection = root.organismCollection;
    let final = {
      'SuperOrganism root': {
        'editattr gravity': { 'Variable': 0 },
        'editattr clones': { 'Variable': 0 },
        'emerattr cloneNumber': { 'Variable': 0 },
        'SuperOrganism tree': {
          'editattr growth': { 'Variable': 0 },
        },
        'SuperOrganism orbit': {
          'editattr orbitSize': { 'Variable': 0 },
          'SuperOrganism moon': {
            'editattr luminosity': { 'Variable': 0 },
          },
          'SuperOrganism earth': {
            'editattr life': { 'Variable': 0 },
          },
        },
      },
    };

    let start = {
      'SuperOrganism root': {
        'editattr gravity': { 'Variable': 0 },
        'editattr clones': { 'Variable': 0 },
        'emerattr cloneNumber': { 'Variable': 0 },
        'SuperOrganism tree': {
          'editattr growth': { 'Variable': 0 },
        },
        'SuperOrganism orbit': {
          'editattr orbitSize': { 'Variable': 0 },
          'SuperOrganism moon': {
            'editattr luminosity': { 'Variable': 0 },
          },
        },
      },
    };
    
    expect(new Root().fromTree(final).toTree()).to.deep.equal(final);

    // --- add organ ---

    let actualRoot = new Root().fromTree(start);
    
    let metaorganism = actualRoot.metaorganismCollection.getFromName('SuperOrganism');
    let earth = actualRoot.organismCollection.putFromMetaWithoutAttributes('earth', metaorganism);
    let orbit = actualRoot.organismCollection.getOrganismFromPath('orbit');
    actualRoot.organismCollection.addChild(orbit, earth);
    actualRoot.attributeCollection.putEditable(earth, 'life');
    expect(actualRoot.toTree()).to.deep.equal(final);
    expect(actualRoot.organismCollection.organisms.length).to.equal(5);
    expect(actualRoot.organismCollection.organs.length).to.equal(4);
    expect(actualRoot.attributeCollection.attributes.length).to.equal(7);
    expect(actualRoot.attributeCollection.attributeParents.length).to.equal(7);
    expect(actualRoot.attributeCollection.rootNodes.length).to.equal(7);
    expect(actualRoot.nodeStore.nodes.length).to.equal(14);
    expect(actualRoot.nodeStore.nodeParents.length).to.equal(7);

    // --- remove organ ---

    actualRoot.organismCollection.remove(earth);
    expect(actualRoot.toTree()).to.deep.equal(start);
    expect(actualRoot.organismCollection.organisms.length).to.equal(4);
    expect(actualRoot.organismCollection.organs.length).to.equal(3);
    expect(actualRoot.attributeCollection.attributes.length).to.equal(6);
    expect(actualRoot.attributeCollection.attributeParents.length).to.equal(6);
    expect(actualRoot.attributeCollection.rootNodes.length).to.equal(6);
    expect(actualRoot.nodeStore.nodes.length).to.equal(12);
    expect(actualRoot.nodeStore.nodeParents.length).to.equal(6);

    // --- remove non leaf organ ---

    let expected = {
      'SuperOrganism root': {
        'editattr gravity': { 'Variable': 0 },
        'editattr clones': { 'Variable': 0 },
        'emerattr cloneNumber': { 'Variable': 0 },
        'SuperOrganism tree': {
          'editattr growth': { 'Variable': 0 },
        },
      },
    };

    actualRoot = new Root().fromTree(final);
    orbit = actualRoot.organismCollection.getOrganismFromPath('orbit');
    let orbitRoot = actualRoot.nodeStore.getFromPath(['orbit'], 'orbitSize');
    let add1 = actualRoot.nodeStore.putChild(orbitRoot, 0, actualRoot.nodeStore.addFun(actualRoot.metafunStore.getFromName('Add')));
    let add2 = actualRoot.nodeStore.putChild(add1, 0, actualRoot.nodeStore.addFun(actualRoot.metafunStore.getFromName('Add')));

    expect(actualRoot.nodeStore.nodes.length).to.equal(18);
    expect(actualRoot.nodeStore.nodeParents.length).to.equal(11);
    
    actualRoot.organismCollection.remove(orbit);

    expect(actualRoot.toTree()).to.deep.equal(expected);
    expect(actualRoot.organismCollection.organisms.length).to.equal(2);
    expect(actualRoot.organismCollection.organs.length).to.equal(1);
    expect(actualRoot.attributeCollection.attributes.length).to.equal(4);
    expect(actualRoot.attributeCollection.attributeParents.length).to.equal(4);
    expect(actualRoot.attributeCollection.rootNodes.length).to.equal(4);
    expect(actualRoot.nodeStore.nodes.length).to.equal(8);
    expect(actualRoot.nodeStore.nodeParents.length).to.equal(4);
  })
  
  it('pen organs', () => {
    let final = {
      'SuperOrganism root': {
        'editattr gravity': { 'Variable': 0 },
        'editattr clones': { 'Variable': 0 },
        'emerattr cloneNumber': { 'Variable': 0 },
        'SuperOrganism tree': {
          'editattr growth': { 'Variable': 0 },
          'editattr har': { 'Variable': 0 },
        },
        'SuperOrganism orbit': {
          'editattr orbitSize': { 'Variable': 0 },
          'SuperOrganism moon': {
            'editattr luminosity': { 'Variable': 0 },
          },
          'SuperOrganism earth': {
            'editattr life': { 'Variable': 0 },
          },
        },
      },
    };
    const root = new Root().fromTree(final);
    const attributeCollection = root.attributeCollection;
    const organismCollection = root.organismCollection;
    const nodeCollection = root.nodeStore;
    const pen = root.penStore;
    root.metafunStore.metafuns = [];

    pen.setPointedNode(nodeCollection.getFromPath(['orbit', 'earth'], 'life', [0]));
    pen.setIsQuerying(true);
    pen.setQuery('');
    let suggestions = pen.getReplacementSuggestions();
    let actual = suggestions.pluck('text').toArray();
    let expected = ['orbit.orbitSize', 'root.gravity', 'root.clones', 'root.cloneNumber'];
    expect(actual).to.deep.equal(expected);

    // --- don't get the orbit ones, still get my ones ---

    pen.setPointedNode(nodeCollection.getFromPath(['tree'], 'growth', [0]));
    pen.setIsQuerying(true);
    pen.setQuery('');
    suggestions = pen.getReplacementSuggestions();
    actual = suggestions.pluck('text').toArray();
    expected = ['tree.har', 'root.gravity', 'root.clones', 'root.cloneNumber'];
    expect(actual).to.deep.equal(expected);
  })

  it('organs compute', () => {
    let final = {
      'SuperOrganism root': {
        'SuperOrganism grid1': {
          'editattr clones': { 'Variable': 0 },
          'editattr gridx': { 'Variable': 0 },
          'emerattr cloneNumber': { 'Variable': 0 },
          'SuperOrganism grid2': {
            'editattr clones': { 'Variable': 0 },
            'editattr gridy': { 'Variable': 0 },
            'emerattr cloneNumber': { 'Variable': 0 },
            'Rectangle square': {
              'editattr x': { 'Variable': 0 },
              'editattr y': { 'Variable': 0 },
            },
          },
        },
      },
    };

    const root = new Root().fromTree(final);
    const attributeCollection = root.attributeCollection;
    const organismCollection = root.organismCollection;
    const nodeCollection = root.nodeStore;

    organismCollection.initRootOrganism();
    const x = nodeCollection.getFromPath(['grid1', 'grid2', 'square'], 'x');
    const y = nodeCollection.getFromPath(['grid1', 'grid2', 'square'], 'y');
    const gridx = nodeCollection.getFromPath(['grid1'], 'gridx');
    const gridy = nodeCollection.getFromPath(['grid1', 'grid2'], 'gridy');
    const grid1clones = nodeCollection.getFromPath(['grid1'], 'clones');
    const grid2clones = nodeCollection.getFromPath(['grid1', 'grid2'], 'clones');
    nodeCollection.putChild(x, 0, nodeCollection.addReference(gridx));
    nodeCollection.putChild(y, 0, nodeCollection.addReference(gridy));
    nodeCollection.putChild(grid1clones, 0, nodeCollection.addNumber(3));
    nodeCollection.putChild(grid2clones, 0, nodeCollection.addNumber(3));
    const actual = wu(root.computeRenderCommands()).toArray();
    const expected = [
      { shape: RenderShape.Rectangle, x: -1, y: -1 },
      { shape: RenderShape.Rectangle, x: -1, y: 0 },
      { shape: RenderShape.Rectangle, x: -1, y: 1 },
      { shape: RenderShape.Rectangle, x: 0, y: -1 },
      { shape: RenderShape.Rectangle, x: 0, y: 0 },
      { shape: RenderShape.Rectangle, x: 0, y: 1 },
      { shape: RenderShape.Rectangle, x: 1, y: -1 },
      { shape: RenderShape.Rectangle, x: 1, y: 0 },
      { shape: RenderShape.Rectangle, x: 1, y: 1 },
    ];

    expect(actual.length).to.equal(expected.length);
    for (const at of actual) {
      expect(expected).to.deep.include(at);
    }
  })

  it("pen test", () => {
    let final = {
      "SuperOrganism root": {
        "editattr clones": { Variable: 0 },
        "editattr gridx": { Variable: 0 },
        "emerattr cloneNumber": { Variable: 0 },
      },
    };

    const root = new Root().fromTree(final);
    const attributeCollection = root.attributeCollection;
    const organismCollection = root.organismCollection;
    const nodeCollection = root.nodeStore;
    const pen = root.pen;

    const gridx = nodeCollection.getFromPath([], "gridx");
    const add = nodeCollection.putChild(gridx, 0, nodeCollection.addFun(root.metafunStore.getFromName('Add')));
    const addChild0 = nodeCollection.getFromPath([], "gridx", [0, 0]);
    const addChild1 = nodeCollection.getFromPath([], "gridx", [0, 1]);
    
    pen.setPenPosition({
      positionType: 'Node',
      referenceNodeId: add.id,
      relation: PenPositionRelation.On,
    });

    pen.moveCursorLeft();
    expect(pen.penPosition).to.deep.equal({
      positionType: "Node",
      referenceNodeId: add.id,
      relation: PenPositionRelation.Before,
    });

    pen.moveCursorLeft();
    expect(pen.penPosition).to.deep.equal({
      positionType: "Node",
      referenceNodeId: add.id,
      relation: PenPositionRelation.Before,
    });

    pen.moveCursorRight();
    expect(pen.penPosition).to.deep.equal({
      positionType: "Node",
      referenceNodeId: add.id,
      relation: PenPositionRelation.On,
    });

    pen.moveCursorRight();
    expect(pen.penPosition).to.deep.equal({
      positionType: "Node",
      referenceNodeId: addChild0.id,
      relation: PenPositionRelation.Before,
    });

    pen.moveCursorRight();
    expect(pen.penPosition).to.deep.equal({
      positionType: "Node",
      referenceNodeId: addChild0.id,
      relation: PenPositionRelation.On,
    });

    pen.moveCursorRight();
    expect(pen.penPosition).to.deep.equal({
      positionType: "Node",
      referenceNodeId: addChild1.id,
      relation: PenPositionRelation.Before,
    });

    pen.moveCursorRight();
    expect(pen.penPosition).to.deep.equal({
      positionType: "Node",
      referenceNodeId: addChild1.id,
      relation: PenPositionRelation.On,
    });

    pen.moveCursorRight();
    expect(pen.penPosition).to.deep.equal({
      positionType: "Node",
      referenceNodeId: addChild1.id,
      relation: PenPositionRelation.On,
    });

    pen.moveCursorLeft();
    expect(pen.penPosition).to.deep.equal({
      positionType: "Node",
      referenceNodeId: addChild1.id,
      relation: PenPositionRelation.Before,
    });

    pen.moveCursorLeft();
    expect(pen.penPosition).to.deep.equal({
      positionType: "Node",
      referenceNodeId: addChild0.id,
      relation: PenPositionRelation.On,
    });

    pen.moveCursorLeft();
    expect(pen.penPosition).to.deep.equal({
      positionType: "Node",
      referenceNodeId: addChild0.id,
      relation: PenPositionRelation.Before,
    });

    pen.moveCursorLeft();
    expect(pen.penPosition).to.deep.equal({
      positionType: "Node",
      referenceNodeId: add.id,
      relation: PenPositionRelation.On,
    });

    pen.moveCursorLeft();
    expect(pen.penPosition).to.deep.equal({
      positionType: "Node",
      referenceNodeId: add.id,
      relation: PenPositionRelation.Before,
    });
  });
})
