import { expect } from 'chai'
import MetaNodes, { MetaNode } from '../../src/code/MetaNodes'
import NodeActions from '../../src/code/NodeActions';

const { Number, Add } = MetaNodes;

describe('HelloWorld.vue', () => {
  it('zero', () => {
    const root = {};
    root.radius = Number.make(root);
    expect(root.radius.parent).to.equal(root);
    expect(root.radius.value).to.equal(0);
  })

  it('ten', () => {
    const root = {};
    root.radius = Number.make(root, 10);
    expect(root.radius.parent).to.equal(root);
    expect(root.radius.value).to.equal(10);
  })

  it('add', () => {
    const root = {};
    root.radius = Add.make(root, 10, 20);
    
    expect(MetaNode.eval(root.radius)).to.equal(30);
  })

  it('add and replace', () => {
    const root = {};
    root.radius = Add.make(root, 10, 20);
    const newNode = Add.make(root, 10, 40);
    NodeActions.replace(root.radius, newNode);
    
    expect(MetaNode.eval(root.radius)).to.equal(50);
  })
})
