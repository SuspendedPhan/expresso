import * as chai from "chai";
import Functions from "../../code/Functions";
import { RenderShape, Root } from "../../store/Root";
import wu from "wu";
import { describe, it, AssertionError } from "./TestRunner";
import * as TestRunner from "./TestRunner";
import threelevels from "./data/threelevels.json";
import { PenPositionRelation } from "@/store/Pen";

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
      equal: function(expected) {
        try {
          chai.assert.strictEqual(actual, expected);
        } catch (error) {
          logAndRethrow(error);
        }
      },
      deep: {
        equal: function(expected) {
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
        },
      },
      throw: function() {
        try {
          chai.assert.throws(actual);
        } catch (error) {
          logAndRethrow(error);
        }
      },
      not: {
        equal: function(expected) {
          try {
            chai.assert.notStrictEqual(actual, expected);
          } catch (error) {
            logAndRethrow(error);
          }
        },
      },
    },
  };
}

TestRunner.clearStore();

describe("HelloWorld.vue", () => {
  it("organism", () => {
    const root = new Root();
    const organismStore = root.organismStore;
    const circle = organismStore.put("circle");
    const circle2 = organismStore.getFromName("circle");
    expect(circle).to.equal(circle2);
  });

  it("attribute", () => {
    const root = new Root();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const circle = organismStore.put("circle");
    const radius = attributeStore.putEditable(circle, "radius");
  });

  it("nested add", () => {
    // return;
    const root = new Root();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const nodeStore = root.nodeStore;
    const metafunStore = root.metafunStore;

    // circle -> radius -> number
    const circle = organismStore.put("circle");
    const radius = attributeStore.putEditable(circle, "radius");
    const radiusRoot = attributeStore.getRootNode(radius);
    const radiusChild = nodeStore.putChild(
      radiusRoot,
      0,
      nodeStore.addNumber(5)
    );

    expect(nodeStore.getParent(radiusChild)).to.equal(radiusRoot);
    expect(nodeStore.getChild(radiusRoot, 0)).to.equal(radiusChild);
    expect(nodeStore.nodes.length === 2);

    // circle -> radius -> variable -> add -> number | number
    const add = nodeStore.addFun(metafunStore.getFromName("Add"));
    nodeStore.putChild(radiusRoot, 0, add);
    expect(() => nodeStore.putChild(radiusRoot, 1, add)).to.throw();

    expect(nodeStore.getChild(radiusRoot, 0).metaname).to.equal("Function");
    expect(nodeStore.nodes.length).to.equal(4);

    const add2 = nodeStore.addFun(metafunStore.getFromName("Add"));
    nodeStore.putChild(add, 0, add2);
    radiusRoot.eval();

    expect(nodeStore.nodes.length).to.equal(6);
  });

  it("reassign variable", () => {
    const root = new Root();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const nodeStore = root.nodeStore;

    const circle = organismStore.put("circle");
    const radius = attributeStore.getRootNode(
      attributeStore.putEditable(circle, "radius")
    );
    const x = attributeStore.getRootNode(
      attributeStore.putEditable(circle, "x")
    );
    const y = attributeStore.getRootNode(
      attributeStore.putEditable(circle, "y")
    );

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
  });

  it("computeRenderCommands", () => {
    return;
    const root = new Root();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const nodeStore = root.nodeStore;
    const metafunStore = root.metafunStore;

    const circle = organismStore.spawn();
    const x = attributeStore.getRootNodeFromName(circle, "x");
    const clones = attributeStore.getRootNodeFromName(circle, "clones");
    const cloneNumber = attributeStore.getRootNodeFromName(
      circle,
      "cloneNumber"
    );

    nodeStore.putChild(clones, 0, nodeStore.addNumber(3));

    expect(x.eval()).to.equal(0); // addProperty
    expect(cloneNumber.eval()).to.equal(0); // addComputed
    expect(clones.eval()).to.equal(3); // assignVariable

    const add = nodeStore.putChild(
      x,
      0,
      nodeStore.addFun(metafunStore.getFromName("Add"))
    );
    nodeStore.putChild(add, 0, nodeStore.addReference(cloneNumber));
    nodeStore.putChild(add, 1, nodeStore.addNumber(3));

    const expected = [{ x: 3 }, { x: 4 }, { x: 5 }];
    const actual = wu(root.computeRenderCommands())
      .map((row) => ({ x: row.x }))
      .toArray();
    expect(actual).to.deep.equal(expected);
  });

  it("getGhostEdits", () => {
    return;
    const root = new Root();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const nodeStore = root.nodeStore;
    const penStore = root.penStore;
    const metafunStore = root.metafunStore;
    metafunStore.metafuns = [
      {
        name: "Add",
        paramCount: 2,
        eval: (a, b) => a.eval() + b.eval(),
      },
    ];

    root.organismCollection.rootOrganism = organismStore.putFromMetaWithoutAttributes(
      "root",
      root.metaorganismCollection.getFromName("SuperOrganism")
    );
    const circle = organismStore.addChild(
      organismStore.getRoot(),
      organismStore.putSuperOrganismWithoutAttributes("circle")
    );
    const x = attributeStore.getRootNode(
      attributeStore.putEditable(circle, "x")
    );
    const y = attributeStore.getRootNode(
      attributeStore.putEditable(circle, "y")
    );
    const clones = attributeStore.getRootNode(
      attributeStore.putEditable(circle, "clones")
    );
    const cloneNumber = attributeStore.getRootNode(
      attributeStore.putEmergent(circle, "cloneNumber")
    );

    let expected;
    let actual;
    let suggestions;

    penStore.setPointedNode(nodeStore.getChild(y, 0));
    penStore.setPointedNode(nodeStore.getChild(x, 0));

    // --- number ---

    penStore.setIsQuerying(true);
    penStore.setQuery("52");
    suggestions = penStore.getGhostEdits();

    expected = ["52"];
    actual = suggestions.map((row) => row.text).toArray();
    expect(actual).to.deep.equal(expected);

    suggestions = penStore.getGhostEdits();
    penStore.commitGhostEdit(suggestions.take(1).toArray()[0]);
    expect(x.eval()).to.equal(52);

    // --- empty query ---
    // should list all, but skip x

    penStore.setIsQuerying(true);
    penStore.setQuery("");
    suggestions = penStore.getGhostEdits();
    expected = ["circle.y", "circle.clones", "circle.cloneNumber", "Add"];
    actual = suggestions.map((row) => row.text).toArray();
    expect(actual).to.deep.equal(expected);

    // --- commit function ---

    suggestions = penStore.getGhostEdits();
    penStore.commitGhostEdit(suggestions.drop(3).toArray()[0]);
    expect(x.eval()).to.equal(0);

    // --- non empty query ---

    penStore.setIsQuerying(true);
    penStore.setQuery("lon");
    suggestions = penStore.getGhostEdits();
    expected = ["circle.clones", "circle.cloneNumber"];
    actual = suggestions.map((row) => row.text).toArray();
    expect(actual).to.deep.equal(expected);

    // --- commit reference ---
    // --- new pointed node ---
    // --- no more querying ---

    suggestions = penStore.getGhostEdits();
    const numberNode = nodeStore.putChild(clones, 0, nodeStore.addNumber(3));
    penStore.commitGhostEdit(suggestions.take(1).toArray()[0]);
    expect(x.eval()).to.equal(3);
    // expect(penStore.pointedNode).to.equal(nodeStore.getChild(x, 0));
    expect(penStore.getIsQuerying()).to.equal(false);
  });

  it("isSubsequence", () => {
    let actual;

    actual = Functions.isSubsequence("cne", "clones");
    expect(actual).to.equal(true);

    actual = Functions.isSubsequence("cneq", "clones");
    expect(actual).to.equal(false);

    actual = Functions.isSubsequence("clones", "clon");
    expect(actual).to.equal(false);

    actual = Functions.isSubsequence("clones", "clones");
    expect(actual).to.equal(true);

    actual = Functions.isSubsequence("", "clones");
    expect(actual).to.equal(true);

    actual = Functions.isSubsequence("x", "");
    expect(actual).to.equal(false);
  });

  it("traverseLeft", () => {
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
            l: {},
          },
          h: {},
        },
      },
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

    traverse = Functions.traverseLeft(
      tree.a.e.g.i.k,
      parentGetter,
      childrenGetter
    );
    actual = traverse.next().value;
    expect(actual).to.equal(tree.a.e.g.i.j);

    traverse = Functions.traverseLeft(tree.a.b.c, parentGetter, childrenGetter);
    actual = traverse.next().value;
    expect(actual).to.equal(tree.a.b);

    traverse = Functions.traverseLeft(tree.a, parentGetter, childrenGetter);
    expect(wu.some(() => true, traverse)).to.equal(false);

    // -- right --

    traverse = Functions.traverseRight(
      tree.a.e.g,
      parentGetter,
      childrenGetter
    );
    actual = traverse.next().value;
    expect(actual).to.equal(tree.a.e.g.i);

    traverse = Functions.traverseRight(
      tree.a.e.g.i.k,
      parentGetter,
      childrenGetter
    );
    actual = traverse.next().value;
    expect(actual).to.equal(tree.a.e.g.l);

    traverse = Functions.traverseRight(tree.a.b, parentGetter, childrenGetter);
    actual = traverse.next().value;
    expect(actual).to.equal(tree.a.b.c);

    traverse = Functions.traverseRight(
      tree.a.e.h,
      parentGetter,
      childrenGetter
    );
    expect(wu.some(() => true, traverse)).to.equal(false);
  });

  it("assign number", () => {
    const root = new Root();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const nodeStore = root.nodeStore;
    const penStore = root.penStore;
    const metafunStore = root.metafunStore;

    const circle = organismStore.put("circle");
    const x = attributeStore.putEditable(circle, "x");
    const cloneNumber = attributeStore.putEmergent(circle, "cloneNumber");
    attributeStore.assignNumber(x, 5);
    attributeStore.assignNumber(cloneNumber, 10);
    expect(attributeStore.getEvaled(x)).to.equal(5);
    expect(attributeStore.getEvaled(cloneNumber)).to.equal(10);
  });

  it("serialize", () => {
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

    const circle = organismStore.putFromMeta(
      "circle",
      root.metaorganismCollection.getFromName("Circle")
    );
    const x = attributeStore.getRootNode(
      attributeStore.putEditable(circle, "xx")
    );
    const y = attributeStore.getRootNode(
      attributeStore.putEditable(circle, "yy")
    );
    attributeStore.putEditable(circle, "yy");

    const addNode = nodeStore.addFun(metafunStore.getFromName("Add"));
    const addNode2 = nodeStore.addFun(metafunStore.getFromName("Add"));
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
  });

  it("pluck", () => {
    let actual;
    let expected;

    actual = Functions.pluck(
      {
        a: 2,
        b: 3,
        c: 5,
      },
      ["a", "b"]
    );
    expected = {
      a: 2,
      b: 3,
    };
    expect(actual).to.deep.equal(expected);

    expect(() => Functions.pluck({}, ["a", "b"])).to.throw();

    actual = Functions.pluck(
      {
        a: 2,
        b: 3,
        c: 5,
      },
      []
    );
    expected = {};
    expect(actual).to.deep.equal(expected);

    actual = Functions.pluck(
      {
        a: 2,
        b: 3,
        c: 5,
      },
      ["a", "b", "c"]
    );
    expected = {
      a: 2,
      b: 3,
      c: 5,
    };
    expect(actual).to.deep.equal(expected);
  });

  it("getAttributesForOrganism", () => {
    const root = new Root();
    const attributeStore = root.attributeStore;
    const organismStore = root.organismStore;
    const nodeStore = root.nodeStore;
    const penStore = root.penStore;
    const metafunStore = root.metafunStore;

    const circle = organismStore.put("circle");
    const x = attributeStore.putEditable(circle, "x");
    const y = attributeStore.putEditable(circle, "y");
    const cloneNumber = attributeStore.putEmergent(circle, "cloneNumber");

    const actual = Array.from(attributeStore.getAttributesForOrganism(circle));
    const expected = [x, y, cloneNumber];
    expect(actual).to.deep.equal(expected);
  });

  it("organs", () => {
    return;
    const root = new Root();
    const attributeCollection = root.attributeCollection;
    const organismCollection = root.organismCollection;
    let final = {
      "SuperOrganism root": {
        "editattr gravity": { "0 Number": 0 },
        "editattr clones": { "0 Number": 0 },
        "emerattr cloneNumber": { "0 Number": 0 },
        "SuperOrganism tree": {
          "editattr growth": { "0 Number": 0 },
        },
        "SuperOrganism orbit": {
          "editattr orbitSize": { "0 Number": 0 },
          "SuperOrganism moon": {
            "editattr luminosity": { "0 Number": 0 },
          },
          "SuperOrganism earth": {
            "editattr life": { "0 Number": 0 },
          },
        },
      },
    };

    let start = {
      "SuperOrganism root": {
        "editattr gravity": { "0 Number": 0 },
        "editattr clones": { "0 Number": 0 },
        "emerattr cloneNumber": { "0 Number": 0 },
        "SuperOrganism tree": {
          "editattr growth": { "0 Number": 0 },
        },
        "SuperOrganism orbit": {
          "editattr orbitSize": { "0 Number": 0 },
          "SuperOrganism moon": {
            "editattr luminosity": { "0 Number": 0 },
          },
        },
      },
    };

    // expect(new Root().fromTree(final).toTree()).to.deep.equal(final);

    // --- add organ ---

    let actualRoot = new Root().fromTree(start);

    let metaorganism = actualRoot.metaorganismCollection.getFromName(
      "SuperOrganism"
    );
    let earth = actualRoot.organismCollection.putFromMetaWithoutAttributes(
      "earth",
      metaorganism
    );
    let orbit = actualRoot.organismCollection.getOrganismFromPath("orbit");
    actualRoot.organismCollection.addChild(orbit, earth);
    actualRoot.attributeCollection.putEditable(earth, "life");
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
      "SuperOrganism root": {
        "editattr gravity": { "0 Number": 0 },
        "editattr clones": { "0 Number": 0 },
        "emerattr cloneNumber": { "0 Number": 0 },
        "SuperOrganism tree": {
          "editattr growth": { "0 Number": 0 },
        },
      },
    };

    actualRoot = new Root().fromTree(final);
    orbit = actualRoot.organismCollection.getOrganismFromPath("orbit");
    let orbitRoot = actualRoot.nodeStore.getFromPath(["orbit"], "orbitSize");
    let add1 = actualRoot.nodeStore.putChild(
      orbitRoot,
      0,
      actualRoot.nodeStore.addFun(actualRoot.metafunStore.getFromName("Add"))
    );
    let add2 = actualRoot.nodeStore.putChild(
      add1,
      0,
      actualRoot.nodeStore.addFun(actualRoot.metafunStore.getFromName("Add"))
    );

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
  });

  it("pen organs", () => {
    let final = {
      "SuperOrganism root": {
        "editattr gravity": { "0 Number": 0 },
        "editattr clones": { "0 Number": 0 },
        "emerattr cloneNumber": { "0 Number": 0 },
        "SuperOrganism tree": {
          "editattr growth": { "0 Number": 0 },
          "editattr har": { "0 Number": 0 },
        },
        "SuperOrganism orbit": {
          "editattr orbitSize": { "0 Number": 0 },
          "SuperOrganism moon": {
            "editattr luminosity": { "0 Number": 0 },
          },
          "SuperOrganism earth": {
            "editattr life": { "0 Number": 0 },
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

    pen.setPointedNode(
      nodeCollection.getFromPath(["orbit", "earth"], "life", [0])
    );
    pen.setIsQuerying(true);
    pen.setQuery("");
    let suggestions = pen.getGhostEdits();
    let actual = wu(suggestions)
      .pluck("text")
      .toArray();
    let expected = [
      "orbit.orbitSize",
      "root.gravity",
      "root.clones",
      "root.cloneNumber",
    ];
    expect(actual).to.deep.equal(expected);

    // --- don't get the orbit ones, still get my ones ---

    pen.setPointedNode(nodeCollection.getFromPath(["tree"], "growth", [0]));
    pen.setIsQuerying(true);
    pen.setQuery("");
    suggestions = pen.getGhostEdits();
    actual = wu(suggestions)
      .pluck("text")
      .toArray();
    expected = ["tree.har", "root.gravity", "root.clones", "root.cloneNumber"];
    expect(actual).to.deep.equal(expected);
  });

  it("organs compute", () => {
    return;
    let final = {
      "SuperOrganism root": {
        "SuperOrganism grid1": {
          "editattr clones": { "0 Number": 0 },
          "editattr gridx": { "0 Number": 0 },
          "emerattr cloneNumber": { "0 Number": 0 },
          "SuperOrganism grid2": {
            "editattr clones": { "0 Number": 0 },
            "editattr gridy": { "0 Number": 0 },
            "emerattr cloneNumber": { "0 Number": 0 },
            "Rectangle square": {
              "editattr x": { "0 Number": 0 },
              "editattr y": { "0 Number": 0 },
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
    const x = nodeCollection.getFromPath(["grid1", "grid2", "square"], "x");
    const y = nodeCollection.getFromPath(["grid1", "grid2", "square"], "y");
    const gridx = nodeCollection.getFromPath(["grid1"], "gridx");
    const gridy = nodeCollection.getFromPath(["grid1", "grid2"], "gridy");
    const grid1clones = nodeCollection.getFromPath(["grid1"], "clones");
    const grid2clones = nodeCollection.getFromPath(
      ["grid1", "grid2"],
      "clones"
    );
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
  });

  it("insert node, from tree", () => {
    let tree = {
      "0 Function Add": {
        "0 Number": 3,
        "1 Function Multiply": {
          "0 Number": 5,
          "1 Number": 2,
        },
      },
    };

    const root = new Root();
    const nodeCollection = root.nodeStore;

    {
      const rootNode = nodeCollection.fromTree(tree);
      expect(rootNode.eval()).to.equal(13);
      const multiplyNode = nodeCollection.getChild(rootNode, 1);
      const insertNode = nodeCollection.addFun(
        root.metafunStore.getFromName("Divide")
      );
      nodeCollection.insertNodeAsParent(multiplyNode, insertNode);

      let expected = {
        "0 Function Add": {
          "0 Number": 3,
          "1 Function Divide": {
            "0 Function Multiply": {
              "0 Number": 5,
              "1 Number": 2,
            },
            "1 Number": 0,
          },
        },
      };

      expect(nodeCollection.toTree2(rootNode)).to.deep.equal(expected);
    }
  });

  // it("ghost edits", () => {
  //   let tree = {
  //     "SuperOrganism root": {
  //       "editattr gravity": {
  //         "0 Function Add": {
  //           "0 Number": 3,
  //           "1 Function Multiply": {
  //             "0 Number": 5,
  //             "1 Number": 2,
  //           },
  //         },
  //       },
  //     },
  //   };

  //   const root = new Root().fromTree(tree);
  //   const pen = root.pen;
  //   const nodeCollection = root.nodeCollection;
  //   expect(root.toTree()).to.deep.equal(tree);

  //   {
  //     const rootNode = nodeCollection.getFromPath([], "gravity", []);
  //     const addNode = nodeCollection.getFromPath([], "gravity", [0]);
  //     pen.setPenPosition({
  //       positionType: "Node",
  //       referenceNodeId: addNode.id,
  //       relation: PenPositionRelation.Before,
  //     });
  //     pen.setQuery("Lerp");
  //     pen.setIsQuerying(true);
  //     const ghostEdit = pen.getGhostEdits().next().value;
  //     pen.commitGhostEdit(ghostEdit);

  //     const expected = {
  //       "0 Variable": {
  //         "0 Function Lerp": {
  //           "0 Function Add": {
  //             "0 Number": 3,
  //             "1 Function Multiply": {
  //               "0 Number": 5,
  //               "1 Number": 2,
  //             },
  //           },
  //           "1 Number": 0,
  //           "2 Number": 0,
  //         },
  //       },
  //     };
  //     expect(nodeCollection.toTree2(rootNode)).to.deep.equal(expected);
  //   }

  //   {
  //     root.fromTree(tree);
  //     const rootNode = nodeCollection.getFromPath([], "gravity", []);
  //     const addNode = nodeCollection.getFromPath([], "gravity", [0]);
  //     pen.setPenPosition({
  //       positionType: "Node",
  //       referenceNodeId: addNode.id,
  //       relation: PenPositionRelation.On,
  //     });
  //     pen.setQuery("Lerp");
  //     pen.setIsQuerying(true);
  //     const ghostEdit = pen.getGhostEdits().next().value;
  //     pen.commitGhostEdit(ghostEdit);

  //     const expected = {
  //       "0 Variable": {
  //         "0 Function Lerp": {
  //           "0 Number": 3,
  //           "1 Function Multiply": {
  //             "0 Number": 5,
  //             "1 Number": 2,
  //           },
  //           "2 Number": 0,
  //         },
  //       },
  //     };
  //     expect(nodeCollection.toTree2(rootNode)).to.deep.equal(expected);
  //   }
  // });

  it("simple integration", () => {
    const root = new Root();
    root.organismCollection.initRootOrganism();
    const attribute = root.attributeCollection.putEditable(
      root.organismCollection.rootOrganism,
      "x"
    );
    root.attributeCollection.getRootNode(attribute);
  });

  it("node drop/add argument", () => {
    return;
    let tree = {
      "SuperOrganism root": {
        "editattr gravity": {
          "0 Function Lerp": {
            "0 Number": 5,
            "1 Number": 2,
            "2 Number": 3,
          },
        },
      },
    };

    const root = new Root().fromTree(tree);
    const pen = root.pen;
    const nodeCollection = root.nodeCollection;
    const lerpNode = nodeCollection.getFromPath([], "gravity", [0]);
    const node0 = nodeCollection.getFromPath([], "gravity", [0, 0]);
    const node1 = nodeCollection.getFromPath([], "gravity", [0, 1]);
    const node2 = nodeCollection.getFromPath([], "gravity", [0, 2]);
    // expect(root.toTree()).to.deep.equal(tree);
    expect(node2.eval()).to.equal(3);

    {
      pen.setPointedNode(lerpNode);
      pen.setIsQuerying(true);
      pen.setQuery("Add");
      const edit = pen.getGhostEdits().next().value;
      expect(edit).to.not.equal(undefined);
      pen.commitGhostEdit(edit);

      const expected = {
        "SuperOrganism root": {
          "editattr gravity": {
            "0 Function Add": {
              "0 Number": 5,
              "1 Number": 2,
            },
          },
        },
      };
      // expect(root.toTree()).to.deep.equal(expected);
      expect(nodeCollection.nodes.getUnique("id", node2.id, false)).to.equal(
        undefined
      );
    }

    {
      pen.setPointedNode(nodeCollection.getFromPath([], "gravity", [0]));
      const expected = {
        "SuperOrganism root": {
          "editattr gravity": {
            "0 Number": 3,
          },
        },
      };
      pen.setIsQuerying(true);
      pen.setQuery("3");
      const edit = pen.getGhostEdits().next().value;
      pen.commitGhostEdit(edit);

      // expect(root.toTree()).to.deep.equal(expected);
      expect(nodeCollection.nodes.getUnique("id", node1.id, false)).to.equal(
        undefined
      );
      expect(nodeCollection.nodes.getUnique("id", node0.id, false)).to.equal(
        undefined
      );
    }
  });

  it("vector", () => {
    const root = new Root();
    const pen = root.pen;
    const nodeCollection = root.nodeCollection;
    const organismCollection = root.organismCollection;
    const attributeCollection = root.attributeCollection;
    const circle = organismCollection.putFromMetaname("circle", "Circle");
    attributeCollection.remove(
      attributeCollection.getAttributeFromName(circle, "radius")
    );
    attributeCollection.remove(
      attributeCollection.getAttributeFromName(circle, "clones")
    );
    attributeCollection.remove(
      attributeCollection.getAttributeFromName(circle, "cloneNumber")
    );
    // attributeCollection.remove(attributeCollection.getAttributeFromName(circle, 'time01'));
    organismCollection.rootOrganism = circle;
    // organismCollection.addChild(organismCollection.getRoot(), circle);

    const commands = Array.from(root.computeRenderCommands());
    expect(commands[0].x).to.equal(0);
    expect(commands[0].y).to.equal(0);
  });

  it("vector2", () => {
    const tree = {
      "SuperOrganism root": {
        "editattr xy Vector": {},
        "editattr radius Number": {},
      },
    };
    const root = new Root().fromTree(tree);
    const pen = root.pen;
    const nodeCollection = root.nodeCollection;
    const organismCollection = root.organismCollection;
    const attributeCollection = root.attributeCollection;
    expect(nodeCollection.getFromPath([], "xy", []).eval().x).to.equal(0);

    pen.setPointedNode(nodeCollection.getFromPath([], "xy", [0]));
    pen.setIsQuerying(true);
    pen.setQuery("radius");
    expect(pen.getGhostEdits().next().done).to.equal(true);

    // --------------------------------------------------------

    pen.setQuery("Add");
    pen.commitFirstGhostEdit();
    const ex = {
      "SuperOrganism root": {
        "editattr xy Vector": {
          "0 Function Add": {
            "0 Vector": {
              "0 Number": 0,
              "1 Number": 0,
            },
            "1 Vector": {
              "0 Number": 0,
              "1 Number": 0,
            },
          },
        },
        "editattr radius Number": {
          "0 Number": 0,
        },
      },
    };

    expect(root.toTree()).to.deep.equal(ex);

    // --------------------------------------------------------
  });

  it("code mirror", () => {
    let tree = {
      "SuperOrganism root": {
        "editattr gravity": {
          "0 Function Add": {
            "0 Number": 3,
            "1 Function Multiply": {
              "0 Number": 52,
              "1 Number": 2,
            },
          },
        },
      },
    };

    const root = new Root().fromTree(tree);
    const pen = root.pen;
    const nodeCollection = root.nodeCollection;
    // expect(root.toTree()).to.deep.equal(tree);

    const organism = root.organismCollection.getRoot();
    const attribute = root.attributeCollection.getAttributeFromName(
      organism,
      "gravity"
    );

    expect(pen.getTextForAttribute(attribute)).to.equal("Add(3,Multiply(52,2))");
    
    pen.setSelection({ attributeId: attribute.id, startIndex: 0, endIndex: 0 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 0, endIndex: 0 });

    pen.setSelection({ attributeId: attribute.id, startIndex: 1, endIndex: 1 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 0, endIndex: 3 });

    pen.setSelection({ attributeId: attribute.id, startIndex: 2, endIndex: 2 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 0, endIndex: 3 });

    pen.setSelection({ attributeId: attribute.id, startIndex: 2, endIndex: 2 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 0, endIndex: 3 });

    pen.setSelection({ attributeId: attribute.id, startIndex: 3, endIndex: 3 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 4, endIndex: 4 });

    pen.setSelection({ attributeId: attribute.id, startIndex: 4, endIndex: 4 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 4, endIndex: 4 });

    pen.setSelection({ attributeId: attribute.id, startIndex: 5, endIndex: 5 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 4, endIndex: 5 });

    pen.setSelection({ attributeId: attribute.id, startIndex: 5, endIndex: 5 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 6, endIndex: 6 });

    pen.setSelection({ attributeId: attribute.id, startIndex: 6, endIndex: 6 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 6, endIndex: 6 });
    
    pen.setSelection({ attributeId: attribute.id, startIndex: 7, endIndex: 7 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 6, endIndex: 14 });
    
    pen.setSelection({ attributeId: attribute.id, startIndex: 14, endIndex: 14 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 15, endIndex: 15 });
    
    pen.setSelection({ attributeId: attribute.id, startIndex: 16, endIndex: 16 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 15, endIndex: 17 });
    
    pen.setSelection({ attributeId: attribute.id, startIndex: 19, endIndex: 19 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 18, endIndex: 19 });
    
    pen.setSelection({ attributeId: attribute.id, startIndex: 20, endIndex: 20 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 18, endIndex: 19 });
    
    pen.setSelection({ attributeId: attribute.id, startIndex: 21, endIndex: 21 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 18, endIndex: 19 });

    // add(3,multiply(52,2))

    pen.setSelection(null);
    expect(pen.getSelection()).to.deep.equal(null);

    // test move left
    pen.setSelection({ attributeId: attribute.id, startIndex: 4, endIndex: 4 });
    pen.setSelection({ attributeId: attribute.id, startIndex: 3, endIndex: 3 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 0, endIndex: 3 });

    // test select paren from no selection
    pen.setSelection(null);
    pen.setSelection({ attributeId: attribute.id, startIndex: 3, endIndex: 3 });
    expect(pen.getSelection()).to.deep.equal({ attributeId: attribute.id, startIndex: 4, endIndex: 4 });
  });
});
