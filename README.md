# 彩票预测系统

一个基于Nuxt.js的彩票预测系统，提供数据分析、预测算法和历史记录管理功能。

## 功能特性

- 📊 **数据分析** - 提供多种图表分析彩票数据
- 🎯 **智能预测** - 基于历史数据的预测算法
- 📈 **趋势分析** - 冷热号码、频率分析等
- 📋 **历史记录** - 完整的开奖历史记录管理
- 🔐 **管理后台** - 安全的管理员界面
- 📤 **数据导出** - 支持导出分析结果

## 技术栈

- **前端**: Nuxt.js 3, Vue.js, Tailwind CSS
- **后端**: Nuxt API Routes
- **数据库**: MySQL
- **图表**: Chart.js, Vue Chart.js
- **状态管理**: Pinia
- **测试**: Vitest

## 快速开始

### 环境要求

- Node.js 18+
- MySQL 5.7+
- pnpm 或 npm

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/lottery-predict.git
cd lottery-predict
```

2. 安装依赖
```bash
pnpm install
# 或
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接：
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=lottery
ADMIN_PASSWORD=your_secure_admin_password
```

4. 初始化数据库
```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE lottery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 导入数据库结构
mysql -u root -p lottery < server/models/database.sql

# 填充测试数据
pnpm run seed
```

5. 启动开发服务器
```bash
pnpm run dev
# 或
npm run dev
```

访问 http://localhost:3000 查看应用。

### 生产环境部署

```bash
# 构建应用
pnpm run build

# 启动应用
pnpm run preview
```

## 项目结构

```
lottery-predict/
├── assets/          # 静态资源
├── components/      # Vue组件
├── layouts/         # 布局组件
├── pages/           # 页面组件
├── plugins/         # Nuxt插件
├── server/          # 服务端代码
│   ├── api/         # API路由
│   ├── models/      # 数据模型
│   ├── scripts/     # 脚本文件
│   ├── services/    # 业务逻辑
│   └── utils/       # 工具函数
├── stores/          # Pinia状态管理
├── tests/           # 测试文件
├── types/           # TypeScript类型定义
└── utils/           # 工具函数
```

## API文档

### 主要接口

- `GET /api/lottery/history` - 获取历史开奖记录
- `GET /api/lottery/analysis` - 获取数据分析结果
- `GET /api/lottery/predict` - 获取预测结果
- `POST /api/lottery/result` - 添加新的开奖结果
- `GET /api/lottery/frequency` - 获取号码频率分析

## 开发指南

### 添加新的预测算法

1. 在 `server/services/PredictionAlgorithm.ts` 中添加新的算法
2. 在 `server/api/lottery/predict.get.ts` 中注册新算法
3. 更新前端预测页面以支持新算法

### 添加新的分析图表

1. 在 `components/charts/` 目录下创建新的图表组件
2. 在 `pages/analysis.vue` 中引入并使用新组件
3. 在 `server/api/lottery/analysis.get.ts` 中添加相应的数据处理逻辑

## 测试

```bash
# 运行测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:run --coverage
```

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 免责声明

本系统仅供学习和研究使用，不保证预测结果的准确性。彩票有风险，投资需谨慎。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件至 your.email@example.com
