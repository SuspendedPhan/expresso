import wu from 'wu';
import { v4 as uuidv4 } from 'uuid';
import { Root } from './Root';

export default class MetaorganismCollection {
  metaorganisms = [
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
  constructor(private root: Root) {}

  getFromName(name) {
    const ans = wu(this.metaorganisms).find(row => row.name === name);
    console.assert(ans !== undefined);
    return ans;
  }
}
