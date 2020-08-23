import { MetanodesByName } from "./Metanodes";
import { v4 as uuidv4 } from 'uuid';

function getMetanodeByDatatype() {
  return MetanodesByName.get('Number');
}

export default class Node {
  static make(metanode, ...args) {
    const answer = {
      metaname: metanode.name,
      id: uuidv4(),
      storetype: 'node',
    };
    if (metanode.metatype === 'Function') {
      answer.children = metanode.params.map(param => Node.make(getMetanodeByDatatype(param.datatype)));
    } else if (metanode.metatype === 'Value') {
      answer.value = args[0] ?? metanode.defaultValue;
    } else if (metanode.name === 'Variable') {
      answer.children = [Node.make(MetanodesByName.get('Number'))];
      answer.path = '';
    } else if (metanode.name === 'Reference') {
      answer.target = args[0] ?? null;
    }
    return answer;
  }

  static eval(node) {
    const metanode = MetanodesByName.get(node.metaname);
    if (metanode.metatype === 'Function') {
      return metanode.eval(...node.children);
    } else {
      return metanode.eval(node);
    }
  }
}