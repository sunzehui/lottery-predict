// 测试环境设置
import { vi } from 'vitest'

// 全局模拟
global.console = {
  ...console,
  // 在测试中忽略日志
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
}

// 模拟 fetch API
global.fetch = vi.fn()

// 模拟 Request 和 Response
global.Request = vi.fn()
global.Response = vi.fn() as any
