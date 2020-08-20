import Node from "./Node";

// todo: changeup the way you make metanodes. i.e. Metanodes.Add

export const Metanodes = [
  {
    name: 'Add',
    metatype: 'Function',
    params: [ 
      { name: 'a' },
      { name: 'b' },
    ],
    eval: (a, b) => Node.eval(a) + Node.eval(b),
  },
  {
    name: 'Number',
    metatype: 'Value',
    defaultValue: 0,
    eval: (node) => node.value,
  },
  {
    name: 'Variable',
    metatype: 'Unimportant',
    eval: (node) => Node.eval(node.children[0]),
  },
  {
    name: 'Reference',
    metatype: 'Unimportant',
    eval: (node) => Node.eval(node.target),
  }
];

export const MetanodesByName = new Map();
for (const metanode of Metanodes) {
  MetanodesByName.set(metanode.name, metanode);
}

export default Metanodes;
