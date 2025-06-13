# Google Maps 数据收集器

基于 Next.js + TypeScript + React 开发的 Google Maps 数据收集工具，使用 SerpApi 的 Google Maps API 进行地图搜索和评论获取。

## 功能特性

### 🔍 地图搜索
- 根据关键词和区域搜索 Google Maps 上的地点
- 支持中文搜索和结果显示
- 实时显示搜索结果数量

### 📍 地点详情
- 查看地点的详细信息（地址、电话、网站、营业时间等）
- 显示地点评分和评论数量
- 支持地点分类标签

### 💬 评论管理
- 获取指定地点的所有用户评论
- 显示评论者信息、评分、日期和内容
- 支持评论图片展示

### 📊 数据导出
- 导出地图搜索结果为 CSV 格式
- 导出地点评论数据为 CSV 格式
- 支持中文字段名和数据

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **UI**: React + Tailwind CSS
- **图标**: Lucide React
- **通知**: React Hot Toast
- **API**: SerpApi Google Maps API

## 快速开始

### 1. 安装依赖

```bash
npm install
# 或
yarn install
```

### 2. 配置环境变量

项目已包含 `.env.local` 文件，其中配置了 SerpApi 的 API Key：

```env
NEXT_PUBLIC_SERPAPI_KEY=bdc98e8a682bbbab5faf67e751e5ed8e29bd1e3e4301f3845129691e5f73acac
NEXT_PUBLIC_API_BASE_URL=https://serpapi.com/search
```

### 3. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 4. 构建生产版本

```bash
npm run build
npm start
# 或
yarn build
yarn start
```

## 使用指南

### 搜索地点

1. 在首页输入关键词（如：餐厅、咖啡店、酒店）
2. 输入搜索区域（如：北京市朝阳区、上海市浦东新区）
3. 点击"搜索"按钮
4. 查看搜索结果列表

### 查看地点详情

1. 在搜索结果中点击任意地点卡片
2. 查看地点的详细信息
3. 点击"加载评论"获取用户评论
4. 浏览所有评论内容

### 导出数据

#### 导出地点数据
- 在首页搜索结果页面点击"导出数据"按钮
- 自动下载包含所有地点信息的 CSV 文件

#### 导出评论数据
- 在地点详情页面加载评论后点击"导出评论"按钮
- 自动下载包含所有评论的 CSV 文件

## API 接口

### Google Maps 搜索 API
- **接口**: `https://serpapi.com/google-maps-api`
- **用途**: 根据关键词和区域搜索地图上的地点
- **返回**: 地点列表，包含名称、地址、评分等信息

### Google Maps 评论 API
- **接口**: `https://serpapi.com/google-maps-reviews-api`
- **用途**: 根据地点的 place_id 获取该地点的所有评论
- **返回**: 评论列表，包含用户信息、评分、内容等

## 项目结构

```
chrome-map-datas/
├── app/                    # Next.js App Router 页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局组件
│   ├── page.tsx           # 首页组件
│   └── place/[id]/        # 地点详情页面
│       └── page.tsx
├── lib/                   # 工具库
│   └── api.ts            # API 调用和数据导出函数
├── types/                 # TypeScript 类型定义
│   └── index.ts
├── .env.local            # 环境变量配置
├── package.json          # 项目依赖
├── tsconfig.json         # TypeScript 配置
├── tailwind.config.js    # Tailwind CSS 配置
└── README.md             # 项目文档
```

## 注意事项

1. **API 限制**: SerpApi 有请求频率限制，请合理使用
2. **数据准确性**: 搜索结果和评论数据来源于 Google Maps，准确性取决于 Google 的数据
3. **网络要求**: 需要稳定的网络连接来访问 SerpApi 服务
4. **浏览器兼容性**: 建议使用现代浏览器（Chrome、Firefox、Safari、Edge）

## 原始需求

1、技术要求
   Nextjs
   Typescript
   React
2、接口列表
   google-maps-api：https://serpapi.com/google-maps-api
   google-maps-reviews-api：https://serpapi.com/google-maps-reviews-api
3、功能列表
   1、根据输入的关键词和区域调用google-maps-api接口进行地图搜索，获得地图上的点
   2、根据地图上的点的place_id调用google-maps-reviews-api接口获取该点的评论
   3、导出所有记录
4、页面列表
   1、首页：输入关键词、区域、搜索、导出
   2、地图点列表
   3、关于地图点的所有评论，导出评论
5、api key: bdc98e8a682bbbab5faf67e751e5ed8e29bd1e3e4301f3845129691e5f73acac

## 许可证

MIT License
