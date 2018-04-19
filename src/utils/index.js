
export { default as random } from './random';

// eslint-disable-next-line
export function totalOffset(node) {
  const offsetTotal = {
    top: 0,
    left: 0,
  };
  while (node) {
    offsetTotal.top += node.offsetTop;
    offsetTotal.left += node.offsetLeft;
    // eslint-disable-next-line
    node = node.offsetParent;
  }
  return offsetTotal;
}

export const ICONS = {
  bmc_tmp: 'help',
  vp: 'group_work',
  cs: 'people',
  r: 'attach_money',
  c: 'account_balance',
  dc: 'local_shipping',
  cr: 'favorite',
  kr: 'store',
  ka: 'settings',
  pn: 'share',
  vpc_tmp: 'help',
  features: 'extension',
  solution: 'done_all',
  pain_gain: 'thumbs_up_down',
  job: 'list',
};

export const COLORS_GESTURE = [
  '#FFF',
  '#000',
  '#C00000',
  '#F00',
  '#FFC000',
  '#FF0',
  '#92D050',
  '#00B050',
  '#00B0F0',
  '#0070C0',
  '#002060',
  '#7030A0',
];

export const COLORS = [
  '#FFF2B5',
  '#C7EFC4',
  '#CAE8FF',
  '#E4C4ED',
  '#FFC3B3',
  '#F3F3F3',
];

export const COLORS_DARK = [
  '#FFB900',
  '#108904',
  '#0078D7',
  '#A500D6',
  '#B82600',
  '#BEBEBE',
];

export const COLORS_MATERIAL = [
  '#ffecb3',
  '#c8e6c9',
  '#bbdefb',
  '#e1bee7',
  '#ffccbc',
  '#f3f3f3',
];

export const COLORS_MATERIAL_DARK = [
  'amber lighten-1',
  'green lighten-1',
  'blue lighten-1',
  'purple lighten-1',
  'deep-orange lighten-1',
  'grey lighten-1',
];

export const TYPE_NAMES = {
  pn: 'Partner Network',
  ka: 'Key Activities',
  kr: 'Key Resources',
  c: 'Cost Structure',
  vp: 'Value Proposition',
  cs: 'Customer Segments',
  cr: 'Customer relationship',
  dc: 'Channels',
  r: 'Revenue Streams',
  features: 'Products and Services',
  solution: 'Solutions',
  job: 'Jobs to be done',
  pain_gain: 'Gains & Pains',
  bmc_tmp: 'Outside',
  vpc_tmp: 'Outside',
};

/*
#ffecb3 Amber 100
#c8e6c9 Green-100
bbdefb Blue 100
e1bee7 Purple 100
FFC3B3 Deep Orange 100
#f5f5f5 Grey 100

  Amber 600
Green 800
Light Blue 700
  Purple A700
  deep Orange 700
    Grey 400
*/
