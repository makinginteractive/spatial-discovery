import p1 from '~/assets/p1.png';
import p2 from '~/assets/p2.png';
import p3 from '~/assets/p3.png';
import p4 from '~/assets/p4.png';
import p5 from '~/assets/p5.png';
import p6 from '~/assets/p6.png';
import p7 from '~/assets/p7.png';
import p8 from '~/assets/p8.png';

export type Product = {
  id: string;
  name: string;
  tag: string;
  price: number;
  image: string;
  story: string;
};

export const products: Product[] = [
  {id: 'noir-vase', name: 'Noir Vessel', tag: 'Object', price: 184, image: p1, story: 'Hand-thrown matte ceramic. A quiet form for slow rooms.'},
  {id: 'amber-eau', name: 'Amber Eau', tag: 'Scent', price: 142, image: p2, story: 'Resin, sandalwood, late summer. Bottled in heavy glass.'},
  {id: 'ivory-knit', name: 'Ivory Knit', tag: 'Apparel', price: 268, image: p3, story: 'Undyed merino, knit slowly in northern Italy.'},
  {id: 'atelier-bag', name: 'Atelier Satchel', tag: 'Leather', price: 540, image: p4, story: 'Vegetable-tanned. Softens with the years that follow you.'},
  {id: 'horizon-watch', name: 'Horizon 38', tag: 'Time', price: 920, image: p5, story: 'Brushed gold, sunburst dial. A small, precise instrument.'},
  {id: 'white-court', name: 'White Court', tag: 'Footwear', price: 195, image: p6, story: 'Italian calfskin. The sneaker reduced to its essentials.'},
  {id: 'obsidian-audio', name: 'Obsidian Audio', tag: 'Sound', price: 380, image: p7, story: 'Closed-back. Forty hours of quiet, between you and the room.'},
  {id: 'tortoise-frames', name: 'Tortoise Frames', tag: 'Optical', price: 220, image: p8, story: 'Acetate, hand-polished. Round, archival, unhurried.'},
];
