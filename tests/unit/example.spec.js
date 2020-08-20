import { expect } from 'chai'
import Node from '../../src/code/Node';
import { MetanodesByName } from '../../src/code/Metanodes';
import { Actions } from '../../src/code/Actions';

function makeNumber(value) {
  const num = Node.make(MetanodesByName.get('Number'));
  num.value = value;
  return num;
}

function makeVariable() {
  return Node.make(MetanodesByName.get('Variable'));
}

function makeReference(target) {
  expect(target).to.not.be.null;
  const answer = Node.make(MetanodesByName.get('Reference'));
  answer.target = target;
  return answer;
}

function makeAdd() {
  return Node.make(MetanodesByName.get('Add'));
}

describe('HelloWorld.vue', () => {
  it('ultimate make and eval test', () => {
    const store = {
      name: 'GodlyCircle',
      radius: {
        metaname: 'Variable',
        path: 'GodlyCircle.radius',
        children: [{
          metaname: 'Number',
          value: 5,
        }],
      },
      children: [{
        name: 'UnholyCircle',
        radius: {
          metaname: 'Variable',
          path: 'GodlyCircle.UnholyCircle.radius',
          children: [],
        },
        children: [{
          name: 'DivineHellCircle',
          radius: {
            metaname: 'Variable',
            path: 'GodlyCircle.UnholyCircle.DivineHellCircle.radius',
            children: [],
          },
          variables: [
            {
              metaname: 'Variable',
              path: 'GodlyCircle.UnholyCircle.DivineHellCircle.addTest',
              children: [],
            }
          ],
        }]
      }],
      variables: [{
        metaname: 'Variable',
        path: 'GodlyCircle.myTea',
        children: [{
          metaname: 'Number',
          value: 10,
        }],
      }],
    };

    store.children[0].radius.children[0] = makeReference(store.radius);
    store.children[0].children[0].radius.children[0] = makeReference(store.variables[0]);

    expect(store.children[0].radius.children[0].target.path).to.equal('GodlyCircle.radius');
    expect(store.children[0].children[0].radius.children[0].target.path).to.equal('GodlyCircle.myTea');
    
    expect(Node.eval(store.children[0].radius)).to.equal(5);
    expect(Node.eval(store.children[0].children[0].radius)).to.equal(10);
    
    const addNode = Node.make(MetanodesByName.get('Add'));
    addNode.children[0] = Node.make(MetanodesByName.get('Variable'));
    addNode.children[1] = Node.make(MetanodesByName.get('Variable'));
    addNode.children[0].children[0] = makeReference(store.radius);
    addNode.children[1].children[0] = makeReference(store.variables[0]);
    store.children[0].children[0].variables[0].children[0] = makeReference(addNode);
    
    expect(Node.eval(store.children[0].children[0].variables[0])).to.equal(15);
  })

  it('simple make add test', () => {
    Node.make(MetanodesByName.get('Add'));
  })

  it('nested add', () => {
    const store = { circle: {}, parentByNode: new Map() };
    
    // circle -> radius -> number
    Actions.addProperty(store, store.circle, 'radius');
    Actions.replaceNode(store, store.circle.radius.children[0], makeNumber(5));

    const circle = store.circle;

    expect(store.parentByNode.get(circle.radius.children[0])).to.equal(circle.radius);
    expect(store.parentByNode.size).to.equal(2);
    
    // circle -> radius -> add -> number | number
    Actions.replaceNode(store, circle.radius.children[0], makeAdd());
    expect(store.parentByNode.get(circle.radius.children[0])).to.equal(circle.radius);
    expect(store.parentByNode.size).to.equal(4);
    
    // circle -> radius -> add -> number | add(number, number)
    Actions.replaceNode(store, circle.radius.children[0].children[0], makeAdd());
    expect(store.parentByNode.get(circle.radius.children[0])).to.equal(circle.radius);
    expect(store.parentByNode.get(circle.radius.children[0].children[0])).to.equal(circle.radius.children[0]);
    expect(store.parentByNode.size).to.equal(6);
    expect(circle.radius.metaname).to.equal('Variable');
    expect(circle.radius.children[0].metaname).to.equal('Add');
    expect(circle.radius.children[0].children[0].metaname).to.equal('Add');
    expect(circle.radius.children[0].children[1].metaname).to.equal('Number');
    expect(circle.radius.children[0].children[0].children[0].metaname).to.equal('Number');
    
    // circle -> radius -> number
    // this is wrong! need to get rid of adds!
    Actions.replaceNode(store, circle.radius.children[0], makeNumber());
    expect(store.parentByNode.size).to.equal(2);
    expect(circle.radius.metaname).to.equal('Variable');
    expect(circle.radius.children[0].metaname).to.equal('Number');
    
    expect(() => Actions.replaceNode(store, circle.radius, makeNumber())).to.throw();
  })

  it('reassign variable', () => {
    const store = { circle: {}, parentByNode: new Map() };
    
    Actions.addProperty(store, store.circle, 'radius');
    Actions.addProperty(store, store.circle, 'x');
    Actions.addProperty(store, store.circle, 'y');

    expect(Node.eval(store.circle.radius)).to.equal(0);
    expect(Node.eval(store.circle.x)).to.equal(0);
    expect(Node.eval(store.circle.y)).to.equal(0);

    Actions.replaceNode(store, store.circle.radius.children[0], makeNumber(5));
    Actions.replaceNode(store, store.circle.x.children[0], makeNumber(7));
    Actions.replaceNode(store, store.circle.y.children[0], makeNumber(9));
    
    expect(Node.eval(store.circle.radius)).to.equal(5);
    expect(Node.eval(store.circle.x)).to.equal(7);
    expect(Node.eval(store.circle.y)).to.equal(9);
    
    // x = radius
    Actions.replaceNode(store, store.circle.x.children[0], makeReference(store.circle.radius));

    expect(Node.eval(store.circle.radius)).to.equal(5);
    expect(Node.eval(store.circle.x)).to.equal(5);
    expect(Node.eval(store.circle.y)).to.equal(9);

    // x = y
    Actions.replaceNode(store, store.circle.x.children[0], makeReference(store.circle.y));

    expect(Node.eval(store.circle.radius)).to.equal(5);
    expect(Node.eval(store.circle.x)).to.equal(9);
    expect(Node.eval(store.circle.y)).to.equal(9);

    // y = 2
    Actions.replaceNode(store, store.circle.y.children[0], makeNumber(2));
    
    expect(Node.eval(store.circle.radius)).to.equal(5);
    expect(Node.eval(store.circle.x)).to.equal(2);
    expect(Node.eval(store.circle.y)).to.equal(2);
    
    // x = 3
    Actions.replaceNode(store, store.circle.x.children[0], makeNumber(3));

    expect(Node.eval(store.circle.radius)).to.equal(5);
    expect(Node.eval(store.circle.x)).to.equal(3);
    expect(Node.eval(store.circle.y)).to.equal(2);
  })
})
