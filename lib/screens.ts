export type Screen = {
  id: string;
  name: string;
};

export const SCREENS: Screen[] = [
  { id: 'intro', name: '基础介绍' },
  { id: 'annotations', name: '细节标注' },
  { id: 'guanyin-east', name: '东方观音' },
  { id: 'at-ease', name: '自在' },
  { id: 'non-duality', name: '不二' },
  { id: 'erosion', name: '流失' },
];

export const TOTAL_SCREENS = SCREENS.length;
