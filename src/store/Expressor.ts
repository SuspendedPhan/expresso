import { Root } from './Root';
import { Position, EditorChange } from 'codemirror';
import Functions from '@/code/Functions';

interface Range {
  start: number;
  end: number;
}

/** For right hand side of attribute */
export default class Expressor {
  queryRange: Range | null = null;
  organism;
  rootNode;
  penResults;

  constructor(private root: Root) {}

  moveCursor(position: number) {
    if (this.queryRange !== null) {
      if (position < this.queryRange.start || position > this.queryRange.end) {
        this.queryRange = null;
      }
    }
  }

  insert(position: number, char: string) {
    if (this.queryRange === null) {
      this.queryRange = {start: position, end: position};
    }

    this.queryRange.end++;
    this.updateAstForInsert(position, this.queryRange);    
  }

  delete(position: number) {
    if (this.queryRange === null) {
      const exNode = this.getExNodeAtPosition(position);
      this.root.nodeCollection.remove(exNode);
    } else {
      this.queryRange.end--;
      this.updateAstForInsert(position, this.queryRange);
    }
  }

  updateAstForInsert(position: number, queryRange: Range) {
    const exNode = this.getExNodeAtPosition(position);
    const queryString = this.getQueryString();
    
    const penResults = this.root.pen.query(queryString, exNode);
    this.root.pen.commit(penResults[0]);
    this.penResults = penResults;
  }

  generateTextTree(node) {
    const textNode = new TextNode();
    this.root.nodeCollection.getChildren(node);
  }

  getQueryString() {

  }

  getExNodeAtPosition(position: number) {

  }
}

interface Character {
  char: string;
  isGhost: boolean;
}

"tri(mod01(time, 50))"

"0 Number": 20,

"0 Function Add": {
  "0 Number": 20,
  "1 Number": 0,
},

class TextNode {
  children: TextNode[] = [];
  getText() {}
}

class FunctionNode extends TextNode {
  name = '';

  getText() {
    return `${this.name}(${this.children.map(t => t.getText()).join(',')})`;
  }
}