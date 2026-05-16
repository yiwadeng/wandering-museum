# Wandering Museum 项目规则

> 本文档是给所有 AI 协作者（Cursor / Claude Code / Codex 等）读的规约。
> 放在项目根目录的 AGENTS.md,每次会话自动生效,不用在 prompt 里重复。

## 项目背景

虚拟博物馆,呈现散落世界各地的中国流失文物。
P0 文物是 Nelson-Atkins Museum 的辽/金代水月观音木雕。
设计风格参考 SBS "The Boat" 的沉浸式滚动叙事。

## 技术栈（严格遵守,不要引入额外的）

- Next.js 16（App Router）
- React Three Fiber + @react-three/drei
- Tailwind CSS
- TypeScript
- 部署:Vercel

## 3D 查看器与 HDRI（约定）

**HDRI / IBL**：glTF 多为 PBR 材质,需要环境贴图才自然。用 `@react-three/drei` 的 `<Environment preset="…" />` 即可,不要用额外包装组件或第二次 `useGLTF` 去「等模型再挂环境」——`Environment` 自己会异步加载 HDR。

**摆放**（`app/page.tsx`）：`<Canvas>` 内 → 与模型同一 `<Suspense>` → 先 `<WatermoonModel />` 再 `<Environment />`。

**可调参数**（换氛围时优先改这些）：

- `Environment` 的 `preset`（如 `sunset`、`studio` 等,drei 内置）
- `Canvas` 的 `gl={{ toneMappingExposure: … }}`
- `ambientLight` / `hemisphereLight` / `directionalLight`
- 画布背景：`<color attach="background" args={[SCENE_BG]} />`

**轨道相机**：`<OrbitControls>` 上的方位角/极角限制、`enablePan={false}`、`enableDamping` 等带有设计意图注释;改数值时**保留或同步更新注释**,方便以后微调。

## 协作者背景

项目负责人是设计师 / 策划,技术新手但逻辑强、审美在线。
解释概念时优先用人话,专业术语首次出现要先解释。

## 核心代码哲学

1. **简洁优先于聪明**
   能用 1 行解决的不要写 10 行,能用 1 个组件解决的不要写 3 个。
   **判断标准**:如果你写完觉得"这看着很高级",
   大概率写多了,删掉一半再给我。

2. **不要 over-engineer**
   不要在没被要求的情况下加缓存层、提取通用 hook、
   引入新依赖、做"未来可能用得到"的抽象。
   **当下需要什么,写什么**。

3. **不要"显得专业"**
   不要为了显得专业搞复杂的抽象、模式、命名空间。
   直白、能跑通、能读懂,比"工业级架构"重要 100 倍。

4. **字面理解我的指令**
   我说什么就做什么,不要"贴心地"多加你以为我想要的功能。
   **反例**:我让你"把 scale 改成 0.3",就只改 scale,
   不要顺手把光照、相机角度、动画速度也"优化"一下。

5. **改动行数最小**
   加一个简单功能,理想是 +1 到 +5 行。
   如果你的方案要 +20 行,**先停下来说明为什么**,
   再问我要不要继续。

## 必须遵守的 "Don't"

- ❌ 不要重复调用同一个 `useGLTF(url)`（GLTF 单点加载；不要用第二次调用来「等模型再挂 Environment」,见上文 **3D 查看器与 HDRI**）
- ❌ 不要主动加 `useMemo` / `useCallback`,
   除非有具体的性能问题
- ❌ 不要主动新建组件,除非现有组件确实塞不下了
- ❌ 不要把 `console.log` 留在最终代码里
- ❌ 不要引入新的 npm 依赖包,除非我明确要求
- ❌ 不要写废话注释(`// set state to true` 这种)。
   只在"为什么这么做"不明显时加注释,
   "是什么"代码本身就该表达
- ❌ 不要顺手重构 / 格式化我没要求改的地方

## 不确定时的行为准则

- 文件不在 context 里 / 路径有疑问 → **先问,不要猜**
- 需求模糊 → **先复述你的理解**,确认后再动手
- 涉及"删除文件 / 重置 git / 强制 push"等不可逆操作
  → **必须先确认**
- 不确定用法或某个库的当前 API → **明说"我不确定"**,
  不要伪造 API

## 改动报告格式

每次改完,按这个格式告诉我:

1. **改了哪个 / 哪些文件**
2. **净增 / 净减行数**(如 `+5 / -2`)
3. **一句话说明做了什么**
4. **遇到的犹豫或选择**(可选):
   如果你有"本来打算 A,但发现不行改成 B",或者
   "在 X 和 Y 之间做了选择",一句话告诉我。
   这样我能从你的判断中学习,而不只看最终结果。

## 一个 meta 原则:保护设计师的注意力

我同时在做 photogrammetry、3D 模型、内容写作、视觉设计——
**注意力是我最稀缺的资源**。

你做的每一个动作(每一条建议、每一个改动、每一段解释),
都要考虑:**这会让我注意力更集中,还是更分散?**

具体表现:
- 优先给我能 copy-paste 直接用的东西,而不是"几种方案让你选"
- 一次只让我做一件事,不要列长任务清单
- 出问题时先给 fix,再解释 why(不要先讲半页原理)
drei <ScrollControls damping={0.25}> 架构,不引入 Lenis,不改回原生 scroll + sticky
ScrollNarrativeDomSync / ScreenTextLayer / narrativeDomRefs 是必要结构,不"简化"