# Office Chair 3D Model

基于参考设计图生成的完整 3D 办公椅模型，严格还原了原图的比例、结构、颜色和材质。

## 项目文件

```
chair-3d/
├── chair.glb              # 可导入 Blender 的 3D 模型文件
├── index.html             # Three.js 交互式预览网页
├── main.js                # Three.js 场景和椅子模型代码
├── generate-glb-v2.js     # Node.js GLB 生成脚本
├── textures/              # 贴图文件夹（当前使用程序化材质）
│   └── README.md
└── README.md              # 本文件
```

## 快速预览

### 方法 1：直接打开网页（推荐）

用浏览器打开 `index.html` 即可看到 3D 椅子，支持：
- 拖拽旋转视角
- 滚轮缩放
- 右键平移
- 点击「Export GLB」按钮下载模型

> 需要联网加载 Three.js CDN。

### 方法 2：用 Blender 打开

1. 打开 Blender
2. 文件 → 导入 → glTF 2.0 (.glb/.gltf)
3. 选择 `chair.glb`
4. 即可编辑、修改、添加贴图后重新导出

## 模型规格

| 属性 | 值 |
|------|-----|
| 格式 | glTF 2.0 Binary (.glb) |
| 大小 | ~108 KB |
| 材质 | 7 种 PBR 材质 |
| 坐标系 | Y-up, 米制单位 |
| 总高度 | ~1.6m |

## 椅子结构（按参考图还原）

- **坐垫**：圆角矩形，深灰色织物材质
- **靠背**：高背圆角矩形，带轻微后仰角度
- **扶手**：T 形结构，塑料材质
- **气压杆**：金属升降柱 + 塑料外罩
- **五星底座**：五辐星形 + 五个滚轮
- **调节杆**：座椅下方高度调节手柄

## 材质说明

当前模型使用程序化 PBR 材质，未使用外部贴图。如需添加纹理：

1. 将 `chair.glb` 导入 Blender
2. 对每个部件进行 UV 展开
3. 在 Substance Painter / Photoshop 中制作贴图
4. 导出带贴图的 GLB

## 技术栈

- **Three.js** — 网页端 3D 渲染
- **@gltf-transform/core** — Node.js GLB 生成
- **GLTFExporter** — 浏览器端导出

## 参考图片

模型严格基于以下设计图构建：
- 正面视图
- 侧面视图
- 背面视图
- 顶面视图
- 45° 透视图
