#!/bin/bash

# PM2 启动脚本

# 创建日志目录
mkdir -p logs

# 检查是否已安装 PM2
if ! command -v pm2 &> /dev/null
then
    echo "PM2 未安装，正在安装..."
    npm install -g pm2
fi

# 构建应用
echo "正在构建应用..."
npm run build

# 启动应用
echo "正在启动应用..."
pm2 start ecosystem.config.js

echo "应用已启动！"
echo "使用 'pm2 list' 查看应用状态"
echo "使用 'pm2 logs lottery-predict' 查看日志"
echo "使用 'pm2 stop lottery-predict' 停止应用"
echo "使用 'pm2 restart lottery-predict' 重启应用"
echo "使用 'pm2 delete lottery-predict' 删除应用"
echo "使用 'pm2 monit' 打开监控面板"
