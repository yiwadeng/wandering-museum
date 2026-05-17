import type { MoonState } from '@/lib/scrollRhythm';

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

export type DetailLabel = {
  id: string;
  text: string;
  /** 标签文字在视口中的位置(百分比 0-100,(0,0) 为左上角) */
  labelPos: { x: number; y: number };
  /** 引线另一端连接到模型部位的位置(百分比 0-100) */
  anchorPos: { x: number; y: number };
};

export type Screen = {
  id: string;
  name: string;
  holdWidth?: number;
  transitionWidth?: number;
  /** 该屏期间锁住相机(禁用旋转),用于引线/标注等精确对位场景 */
  lockCamera?: boolean;
  /** 该屏的引线标签数组,DetailLabelsLayer 会读取 */
  labels?: DetailLabel[];
  /** 该屏背景模式,不填默认 'dark' */
  bgMode?: 'dark' | 'warm';
  /** 该屏月亮状态,不填该屏月亮隐藏 */
  moonState?: MoonState;
  desktop: ScreenModelState;
  mobile: ScreenModelState;
  /** 无此字段或留空表示该屏不叠文字 */
  text?: ScreenText;
};

const introDesktop: ScreenModelState = {
  position: [0.35, -1.05, 1.10],
  scale: 0.16,
  rotation: [-1.24, 0.38, 0.50],
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
  placement: 'model-right',
  title: '辽代彩绘木雕水月观音造像',
  lines: [
    '【年代】辽(907-1125)- 金(1115-1234)',
    '【尺寸】241.3 × 167.64 × 110.49 cm',
    '【工艺】木雕、油漆彩绘',
    '【现存】纳尔逊-阿特金斯博物馆',
  ],
  body: '现存最大最完整的木雕观音(杨木),造型雍容,技艺精湛,被誉为"宗教和美学的胜利"。整座木雕除右手臂外,连同底座都由一整块木头雕成,保存完好,极为难得。历代持续上色,最近的彩漆来自明代,可见千年间,其身在庙宇,却从未离开人间。原址为山西某寺庙,1934 年,由堪萨斯城纳尔逊-阿特金斯艺术博物馆购于古董商人卢芹斋。',
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

const detailLabelsDesktop: ScreenModelState = {
  position: [0, 0, 0], scale: 0.15, rotation: [-0.2, 0.05, 0.1], modelVisible: true,
};
const detailLabelsText: ScreenText = {
  placement: 'below-model',
  title: '细节标注',
  body: '①自在坐 / ②高束发髻 / ③宝冠·化佛(遗失) / ④璎珞 / ⑤臂钏 / ⑥披帛 / ⑦绛裙 / ⑧普陀岩 / ⑨踏莲',
  smallPrint: '(待实现:引线图层 + 放大镜工具,本屏模型锁住不旋转)',
};

const notTwoDesktop: ScreenModelState = {
  position: [0.1, 0, 0], scale: 0.13, rotation: [0, 0, 0], modelVisible: true,
};
const notTwoText: ScreenText = {
  placement: 'model-right',
  title: '不二',
  subtitle: '女面男身,超脱对立',
  body: '南北朝至明清,观音由男相渐变为女相。辽金时期的这尊,正处于女面男身的过渡之间——还没有决定要成为谁。',
  smallPrint: '(待实现:朝代时间互动滑块,拖动查看形象演变)',
};

const aigcSaplingDesktop: ScreenModelState = {
  position: [0, 0, 0], scale: 0.05, rotation: [0, 0, 0], modelVisible: false,
};
const aigcSaplingText: ScreenText = {
  placement: 'below-model',
  title: '约公元 8 世纪',
  body: '一棵小杨树在中国北方某地扎根。数百年间,它沐浴过大唐的风雨,看见过安史之乱、五代烽火,感受过来自北方铁蹄的大地震动,也听过十几代百姓的哭声和笑声。',
  smallPrint: '(待实现:AIGC 树苗成长视频 + 月亮扩张成暖色满屏背景)',
};

const aigcTreeDesktop: ScreenModelState = {
  position: [0, -0.05, 0], scale: 0.14, rotation: [-0.1, 0, 0.1], modelVisible: true,
};
const aigcTreeText: ScreenText = {
  placement: 'below-model',
  title: '一木造·成树',
  body: '经过辽代工匠的雕凿,这一切便通过观音的双眼,与每个仰望她的人静静对视。',
  smallPrint: '(待实现:AIGC 大树变木料、木料变观音的接驳视频,末帧与 3D 模型对齐)',
};

const yimuzaoDesktop: ScreenModelState = {
  position: [0.1, 0.05, 0], scale: 0.13, rotation: [-0.1, 0.1, 0.2], modelVisible: true,
};
const yimuzaoText: ScreenText = {
  placement: 'model-right',
  title: '一木造',
  body: '除伸出的右手臂外,整个木雕由一根完整的木料雕成。这种体量的"一木造"在世界木雕史上极其罕见。木雕宽近 1.7 米,需要直径 1.8-2 米的巨型杨木为原料,树龄约 300-500 年。',
  smallPrint: '(待实现:月亮叠化成年轮、巨大树桩背景)',
};

const yimuzaoRipplesDesktop: ScreenModelState = {
  position: [-0.05, -0.1, 0], scale: 0.15, rotation: [-0.3, 0.1, 0.3], modelVisible: true,
};
const yimuzaoRipplesText: ScreenText = {
  placement: 'below-model',
  title: '一木造·涟漪',
  body: '古代木雕工匠从背面开槽,掏空内芯——内外壁同步接触空气,千年不易开裂。一木之内,藏着一棵杨树千年的呼吸。',
  smallPrint: '(待实现:观音上下浮动 + 同步涟漪扩散动画)',
};

const lossHistoryDesktop: ScreenModelState = {
  position: [-1.8, 0, 0], scale: 0.08, rotation: [0, 0.3, 0], modelVisible: true,
};
const lossHistoryText: ScreenText = {
  placement: 'model-right',
  title: '流失历史',
  body: '20 世纪初,西方艺术市场对"中国雕塑"的需求骤增。一面是买方市场催生的源头掠夺,一面是部分文物因西方博物馆而留存。圆明园的被掠、敦煌的被盗、寺庙的被贩——是不同路径,需要分别讲述。',
  smallPrint: '(待实现:北平古董店历史照片 + AIGC 模拟场景图,模型转为半透明背景底纹)',
};

const nelsonTempleDesktop: ScreenModelState = {
  position: [0, 0, 0], scale: 0.13, rotation: [0, 0, 0], modelVisible: true,
};
const nelsonTempleText: ScreenText = {
  placement: 'below-model',
  title: '如今,在纳尔逊',
  body: '1934 年,堪萨斯城纳尔逊-阿特金斯艺术博物馆购于古董商人卢芹斋。她从此栖身于一座异国的中式厅堂——既是归处,也是无法归家的归处。',
  smallPrint: '(待实现:高斯喷溅生成的纳尔逊中国庙厅 3D 空间为背景,可上下左右查看)',
};

const postscriptDesktop: ScreenModelState = {
  position: [0, 0, 0], scale: 0.05, rotation: [0, 0, 0], modelVisible: false,
};
const postscriptText: ScreenText = {
  placement: 'below-model',
  title: '后记 & 文献',
  body: '本词条参考自纳尔逊-阿特金斯艺术博物馆官方藏品记录、芝加哥大学东亚研究中心相关论文,及《华严经·普门品》《观音造像史》等文献。',
  smallPrint: '(待实现:可展开脚注引用列表,点击展开、10 秒自动收回)',
};

export const SCREENS: Screen[] = [
  {
    id: 'intro',
    name: '基础介绍',
    desktop: introDesktop,
    mobile: { ...introDesktop },
    text: introText,
    holdWidth: 0.03,
    transitionWidth: 0.25,
    bgMode: 'dark',
    moonState: { positionX: -16, positionY: -8, sizePx: 640, sizeVh: 0, opacity: 0.85 },
  },
  {
    id: 'detail-labels',
    name: '细节标注',
    desktop: detailLabelsDesktop,
    mobile: { ...detailLabelsDesktop },
    text: detailLabelsText,
    lockCamera: true,
    labels: [
      { id: 'zizai',  text: '自在坐',       labelPos: { x: 22, y: 38 }, anchorPos: { x: 40, y: 50 } },
      { id: 'faji',   text: '高束发髻',     labelPos: { x: 38, y: 12 }, anchorPos: { x: 48, y: 18 } },
      { id: 'baoguan',text: '宝冠 / 化佛(遗失)', labelPos: { x: 64, y: 14 }, anchorPos: { x: 53, y: 16 } },
      { id: 'yingluo',text: '璎珞',         labelPos: { x: 70, y: 32 }, anchorPos: { x: 52, y: 36 } },
      { id: 'bichuan',text: '臂钏',         labelPos: { x: 26, y: 46 }, anchorPos: { x: 39, y: 42 } },
      { id: 'pibo',   text: '披帛',         labelPos: { x: 70, y: 44 }, anchorPos: { x: 54, y: 42 } },
      { id: 'jiangqun',text:'绛裙',         labelPos: { x: 70, y: 56 }, anchorPos: { x: 52, y: 56 } },
      { id: 'putuo',  text: '普陀岩',       labelPos: { x: 24, y: 72 }, anchorPos: { x: 42, y: 70 } },
      { id: 'taLian', text: '踏莲',         labelPos: { x: 70, y: 72 }, anchorPos: { x: 53, y: 72 } },
    ],
    bgMode: 'dark',
    moonState: { positionX: 32, positionY: -32, sizePx: 200, sizeVh: 0, opacity: 1 },
  },
  {
    id: 'dongfang-guanyin',
    name: '东方观音',
    desktop: dongfangDesktop,
    mobile: { ...dongfangDesktop },
    text: dongfangText,
    holdWidth: 0.20,
    transitionWidth: 0.25,
    bgMode: 'dark',
    moonState: { positionX: -28, positionY: 20, sizePx: 280, sizeVh: 0, opacity: 0.95 },
  },
  {
    id: 'at-ease',
    name: '自在',
    desktop: atEaseDesktop,
    mobile: { ...atEaseDesktop },
    text: atEaseText,
    holdWidth: 0.27,
    bgMode: 'dark',
    moonState: { positionX: -15, positionY: -8, sizePx: 520, sizeVh: 0, opacity: 1 },
  },
  { id: 'not-two', name: '不二',
    desktop: notTwoDesktop, mobile: { ...notTwoDesktop }, text: notTwoText,
    bgMode: 'dark',
    moonState: { positionX: 0, positionY: -25, sizePx: 280, sizeVh: 0, opacity: 0.9 } },
  { id: 'aigc-sapling', name: '一木造·树苗',
    desktop: aigcSaplingDesktop, mobile: { ...aigcSaplingDesktop }, text: aigcSaplingText,
    bgMode: 'warm',
    moonState: { positionX: 0, positionY: 0, sizePx: 0, sizeVh: 200, opacity: 1 } },
  { id: 'aigc-tree-to-guanyin', name: '一木造·成树',
    desktop: aigcTreeDesktop, mobile: { ...aigcTreeDesktop }, text: aigcTreeText,
    bgMode: 'warm',
    moonState: { positionX: 0, positionY: 0, sizePx: 0, sizeVh: 200, opacity: 1 } },
  { id: 'yimuzao', name: '一木造',
    desktop: yimuzaoDesktop, mobile: { ...yimuzaoDesktop }, text: yimuzaoText,
    bgMode: 'dark',
    moonState: { positionX: 32, positionY: -32, sizePx: 200, sizeVh: 0, opacity: 1 } },
  { id: 'yimuzao-ripples', name: '一木造·涟漪',
    desktop: yimuzaoRipplesDesktop, mobile: { ...yimuzaoRipplesDesktop }, text: yimuzaoRipplesText,
    bgMode: 'dark' },
  { id: 'loss-history', name: '流失历史',
    desktop: lossHistoryDesktop, mobile: { ...lossHistoryDesktop }, text: lossHistoryText,
    bgMode: 'dark' },
  { id: 'nelson-temple', name: '纳尔逊的中国庙宇',
    desktop: nelsonTempleDesktop, mobile: { ...nelsonTempleDesktop }, text: nelsonTempleText,
    bgMode: 'dark' },
  { id: 'postscript', name: '后记 & 文献',
    desktop: postscriptDesktop, mobile: { ...postscriptDesktop }, text: postscriptText,
    bgMode: 'dark' },
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
