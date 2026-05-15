export type ScreenModelState = {
  position: [number, number, number];
  scale: number;
  /** 三轴欧拉角(弧度),顺序 X、Y、Z */
  rotation: [number, number, number];
  /** 缺省为 true；false 时该屏模型淡出 */
  modelVisible?: boolean;
};

/** 文字相对视口的大致方位(毛坯参照) */
export type ScreenTextPlacement = 'below-model' | 'model-right' | 'model-left';

export type ScreenText = {
  placement: ScreenTextPlacement;
  title: string;
  subtitle?: string;
  /** 逐行正文 */
  lines?: string[];
  /** 单段正文 */
  body?: string;
  smallPrint?: string;
  /** 下半区占位(如轮播),纯文案展示 */
  carouselPlaceholder?: string;
};

export type Screen = {
  id: string;
  name: string;
  desktop: ScreenModelState;
  mobile: ScreenModelState;
  /** 无此字段或留空表示该屏不叠文字 */
  text?: ScreenText;
};

const introDesktop: ScreenModelState = {
  position: [-0.1, -0.1, 0],
  scale: 0.16,
  rotation: [-0.5, 0.15, 0.45],
  modelVisible: true,
};

const dongfangDesktop: ScreenModelState = {
  position: [-2.1, 0.05, 0.6],
  scale: 0.12,
  rotation: [-0.2, 1.0, -0.3],
  modelVisible: true,
};

const atEaseDesktop: ScreenModelState = {
  position: [0.9, -0.1, 0],
  scale: 0.14,
  rotation: [-0.1, -0.5, 0.55],
  modelVisible: true,
};

const introText: ScreenText = {
  placement: 'below-model',
  title: '辽代彩绘木雕水月观音造像',
  lines: [
    '【年代】辽(907-1125)- 金(1115-1234)',
    '【尺寸】241.3 × 167.64 × 110.49 cm',
    '【工艺】木雕、油漆彩绘',
    '【现存】纳尔逊-阿特金斯博物馆',
    '现存最大最完整的木雕观音(杨木),造型雍容,技艺精湛,被誉为"宗教和美学的胜利"。整座木雕除右手臂外,连同底座都由一整块木头雕成,保存完好,极为难得。历代持续上色,最近的彩漆来自明代,可见千年间,其身在庙宇,却从未离开人间。原址为山西某寺庙,1934 年,由堪萨斯城纳尔逊-阿特金斯艺术博物馆购于古董商人卢芹斋。',
  ],
};

const dongfangText: ScreenText = {
  placement: 'model-right',
  title: '东方观音',
  body: '其名或源于《华严经》"水月道场",视觉形象最早可能始于中唐时期。据记载,约 8 世纪末,唐代画家周昉在长安圣光寺,画下第一尊水月观音。虽然原作早已散佚——但他所创的水、月、竹、石样式,延续了千年。',
  smallPrint: '月映千江,万缘皆空',
  carouselPlaceholder: '图片轮播区(待实现)',
};

const atEaseText: ScreenText = {
  placement: 'model-left',
  title: '自在',
  subtitle: '心无挂碍,世间自在',
  body: '玄奘重译"观音"为"观自在",认为"自在"更符合梵文 Avalokiteśvara 原意。水月观音的自在坐(又名游戏坐),是一种放松而高贵的坐姿。梁思成总结为:一足下垂,一足上踞,一臂下垂,一臂倚踞足膝上。',
};

export const SCREENS: Screen[] = [
  {
    id: 'intro',
    name: '基础介绍',
    desktop: introDesktop,
    mobile: { ...introDesktop },
    text: introText,
  },
  {
    id: 'dongfang-guanyin',
    name: '东方观音',
    desktop: dongfangDesktop,
    mobile: { ...dongfangDesktop },
    text: dongfangText,
  },
  {
    id: 'at-ease',
    name: '自在',
    desktop: atEaseDesktop,
    mobile: { ...atEaseDesktop },
    text: atEaseText,
  },
];

export const TOTAL_SCREENS = SCREENS.length;

/** 当前阶段叙事布局只用 desktop；mobile 占位与 desktop 相同。screen 无效时回退第一屏,避免越界崩溃。 */
export function getScreenLayout(screen: Screen | undefined): ScreenModelState {
  if (screen?.desktop) return screen.desktop;
  const first = SCREENS[0];
  if (first?.desktop) return first.desktop;
  return {
    position: [0, 0, 0],
    scale: 0.2,
    rotation: [0, 0, 0],
    modelVisible: true,
  };
}
