/**
 * Vitest 全局 setup：在每个测试文件之前执行。
 *
 * 关键点 1：注入全局 uniCloud
 *   task-co/index.obj.js 顶部 `const db = uniCloud.database()` 在 require 阶段就执行，
 *   全局对象必须早于任何 import 准备好。
 *
 * 关键点 2：拦截 require('uni-id-common')
 *   云函数走 Node 原生 require，vite alias 和 vi.mock 都无法拦截 CJS 内部的 require。
 *   通过 patch Module._resolveFilename，把 'uni-id-common' 重定向到 tests/stubs/。
 */
import { vi, beforeEach } from 'vitest'
import Module from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STUB_UNI_ID_COMMON = path.resolve(__dirname, './stubs/uni-id-common.js')

const REDIRECTS = {
  'uni-id-common': STUB_UNI_ID_COMMON
}

const originalResolve = Module._resolveFilename
Module._resolveFilename = function (request, parent, ...rest) {
  if (REDIRECTS[request]) {
    return REDIRECTS[request]
  }
  return originalResolve.call(this, request, parent, ...rest)
}

function createCommandStub() {
  return {
    remove: () => ({ __op: 'remove' }),
    aggregate: {
      gte: (v) => ({ __op: 'gte', v }),
      lte: (v) => ({ __op: 'lte', v }),
      arrayElemAt: (args) => ({ __op: 'arrayElemAt', args })
    }
  }
}

globalThis.uniCloud = {
  database: () => ({
    command: createCommandStub(),
    collection: () => {
      throw new Error('uniCloud.database().collection 默认未实现，请在测试中 mock')
    }
  }),
  deleteFile: vi.fn().mockResolvedValue({ fileList: [] })
}

beforeEach(() => {
  vi.restoreAllMocks()
})
