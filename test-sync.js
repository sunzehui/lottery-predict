// 测试脚本 - 使用 curl 或浏览器直接访问 API 端点进行测试
console.log('测试脚本使用说明:')
console.log('1. 使用 curl 测试: curl "http://localhost:3000/api/lottery/sync?drawId=2025099"')
console.log('2. 或在浏览器中访问: http://localhost:3000/api/lottery/sync?drawId=2025099')
console.log('3. 观察控制台输出，检查是否成功获取开奖数据')
console.log('')
console.log('测试用例:')
console.log('- 已知存在的期号: 2025099')
console.log('- 可能不存在的期号: 2099099 (用于测试错误处理)')
