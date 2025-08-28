# PM2 使用说明

本项目已配置PM2进程管理器，用于生产环境部署和管理。

## 文件说明

- `ecosystem.config.js` - PM2配置文件
- `pm2.sh` - PM2启动脚本
- `logs/` - 日志文件目录（自动创建）

## 快速开始

### 1. 使用启动脚本（推荐）

```bash
# 给脚本添加执行权限
chmod +x pm2.sh

# 运行启动脚本
./pm2.sh
```

### 2. 手动启动

```bash
# 构建应用
npm run build

# 启动应用
pm2 start ecosystem.config.js
```

## PM2 常用命令

```bash
# 查看应用状态
pm2 list

# 查看日志
pm2 logs lottery-predict

# 停止应用
pm2 stop lottery-predict

# 重启应用
pm2 restart lottery-predict

# 删除应用
pm2 delete lottery-predict

# 打开监控面板
pm2 monit

# 查看应用详细信息
pm2 show lottery-predict

# 查看PM2日志
pm2 logs

# 重载应用（零停机）
pm2 reload lottery-predict
```

## 环境变量

PM2配置文件中已包含以下环境变量：

- `NODE_ENV` - 运行环境（production/development）
- `DB_HOST` - 数据库主机
- `DB_PORT` - 数据库端口
- `DB_USER` - 数据库用户名
- `DB_PASSWORD` - 数据库密码
- `DB_NAME` - 数据库名称
- `ADMIN_PASSWORD` - 管理员密码

## 日志管理

日志文件位于 `logs/` 目录下：

- `combined.log` - 综合日志
- `out.log` - 输出日志
- `error.log` - 错误日志

## 注意事项

1. 首次部署前请确保已安装PM2：`npm install -g pm2`
2. 确保数据库配置正确
3. 生产环境建议使用`production`环境变量
4. 如需修改环境变量，请编辑`ecosystem.config.js`文件

## 故障排除

如果应用无法启动，请检查：

1. 是否已执行构建步骤：`npm run build`
2. 数据库连接是否正常
3. 端口是否被占用
4. 日志文件中的错误信息
