# 数据库脚本说明

## 填充 number_frequency 表

`number_frequency` 表用于存储号码频率统计信息，包括每个红球和蓝球的出现次数、最后出现期号和日期。

### 使用填充脚本

当 `number_frequency` 表为空时，可以运行以下脚本来填充数据：

```bash
npx tsx server/scripts/fill-frequency.ts
```

### 脚本功能

1. 检查 `lottery_results` 表中是否有数据
2. 如果没有数据，提示先运行 `seed-data.ts` 脚本
3. 清空 `number_frequency` 表
4. 从 `lottery_results` 表中获取所有历史数据
5. 统计每个红球和蓝球的出现频率
6. 将统计结果插入到 `number_frequency` 表中

### 验证数据

可以使用测试脚本来验证数据是否正确填充：

```bash
npx tsx server/scripts/test-frequency.ts
```

### 注意事项

1. 运行填充脚本前，确保 `lottery_results` 表中有数据
2. 如果添加了新的历史数据，需要重新运行填充脚本来更新频率统计
3. 系统中的 `AnalysisModel.updateFrequency()` 方法可以用来更新单个期号的频率统计

## 填充历史数据

如果需要填充示例历史数据，可以运行：

```bash
npx tsx server/scripts/seed-data.ts
```

这将生成最近30期的示例双色球数据。
