import wu from 'wu';
import { v4 as uuidv4 } from 'uuid';
import { RenderShape, Root } from './Root';

export interface MetaOrganism {
  id,
  name,
  attributes,
  renderShape,
}

export default class MetaorganismCollection {
  metaorganisms = [
    {
      id: '1c889037-b904-45ef-a112-421f5fc06b25',
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
      renderShape: RenderShape.Circle,
    },
    {
      id: '16007b7c-7316-458e-8cc1-c76fed08bafc',
      name: 'Rectangle',
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
          name: 'width',
          default: 50,
        },
        {
          name: 'height',
          default: 50,
        },
      ],
      renderShape: RenderShape.Rectangle,
    },
    {
      id: 'a0ee011c-aaae-4c4c-9514-98fcf7da5996',
      name: 'SuperOrganism',
      attributes: [
      ],
      renderShape: RenderShape.None,
    },
    {
      id: '72dd804d-a9d4-4a47-b6bd-7672f39bf255',
      name: 'TheVoid',
      attributes: [
      ],
      renderShape: RenderShape.None,
    },
  ];
  constructor(private root: Root) {}

  getFromName(name): MetaOrganism {
    const ans = wu(this.metaorganisms).find(row => row.name === name);
    console.assert(ans !== undefined);
    return ans as MetaOrganism;
  }
  
  getFromId(id): MetaOrganism {
    const ans = wu(this.metaorganisms).find(row => row.id === id);
    console.assert(ans !== undefined);
    return ans as MetaOrganism;
  }

  getMetaorganisms(): MetaOrganism[] {
    return this.metaorganisms;
  }
}
