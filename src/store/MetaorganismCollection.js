import wu from 'wu';
import { v4 as uuidv4 } from 'uuid';

export default class MetaorganismCollection {
  /**
   * @param {RootStore} root 
   */
  constructor(root) {
    this.root = root;
    this.metaorganisms = [
      {
        id: uuidv4(),
        name: 'Circle',
        attributes: [
          {
            name: 'x',
            default: 0,
          },
          {
            name: 'y',
            default: 0,
          },
          {
            name: 'radius',
            default: 50,
          },
        ],
      }
    ];
  }

  getFromName(name) {
    const ans = wu(this.metaorganisms).find(row => row.name === name);
    console.assert(ans);
    return ans;
  }
}
