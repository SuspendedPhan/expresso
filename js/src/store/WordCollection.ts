export default class WordCollection {
  getRandomWord() {
    return this.words[Math.floor(Math.random() * this.words.length)];
  }

  public static toRandomWordIfEmpty(text: string): string {
    console.assert(text != null);
    if (text === '') {
      return (new WordCollection()).getRandomWord();
    }
    return text;
  }

words = [
  'part',
'berry',
'hand',
'rose',
'detail',
'measure',
'calculator',
'grandmother',
'plot',
'scale',
'flight',
'behavior',
'dinner',
'trail',
'building',
'morning',
'rhythm',
'transport',
'tent',
'bikes',
'eye',
'giraffe',
'yoke',
'tooth',
'dolls',
'ants',
'loss',
'cannon',
'earth',
'rabbit',
'brake',
'flag',
'yard',
'stick',
'wave',
'cheese',
'nut',
'pizzas',
'things',
'drawer',
'earthquake',
'nation',
'flame',
'decision',
'trucks',
'sock',
'adjustment',
'impulse',
'chin',
'donkey',
'iron',
'thought',
'pets',
'art',
'fire',
'experience',
'waves',
'station',
'tray',
'friend',
'veil',
'cough',
'page',
'neck',
'sweater',
'box',
'blood',
'fall',
'street',
'robin',
'duck',
'guide',
'string',
'sneeze',
'trade',
'move',
'interest',
'needle',
'insurance',
'sound',
'structure',
'touch',
'distribution',
'aunt',
'sticks',
'example',
'bear',
'zephyr',
'children',
'destruction',
'quiver',
'sand',
'attraction',
'tongue',
'back',
'elbow',
'tail',
'flower',
'cup',
'view',

'feeling',
'bubble',
'air',
'coil',
'destruction',
'farm',
'pump',
'men',
'ticket',
'camp',
'stitch',
'lumber',
'turkey',
'hall',
'tongue',
'development',
'worm',
'fireman',
'fish',
'root',
'wine',
'whistle',
'cushion',
'use',
'company',
'cast',
'notebook',
'alarm',
'crook',
'wood',
'group',
'talk',
'beef',
'hair',
'structure',
'clam',
'expansion',
'quicksand',
'veil',
'grape',
'tooth',
'umbrella',
'aunt',
'health',
'soda',
'toothpaste',
'addition',
'dinosaurs',
'shop',
'middle',
'orange',
'play',
'skirt',
'arch',
'cactus',
'fog',
'walk',
'class',
'sack',
'apparel',
'price',
'kittens',
'morning',
'bead',
'self',
'wren',
'sea',
'mine',
'town',
'advice',
'hook',
'pleasure',
'jellyfish',
'stem',
'calculator',
'size',
'songs',
'icicle',
'top',
'scarf',
'dirt',
'nose',
'slave',
'distribution',
'bomb',
'stick',
'trouble',
'corn',
'boat',
'boot',
'bells',
'pen',
'land',
'dinner',
'guitar',
'reward',
'chickens',
'meeting',
'route',
'stew',
];
}