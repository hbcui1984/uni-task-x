import { describe, test, expect, beforeEach, vi } from 'vitest'
import { createCollectionMock, installDatabaseMock } from './helpers/db-mock.js'
// stub/uni-id-common 通过 setup.js 中的 Module._resolveFilename hook
// 替代了 task-co 里的 require('uni-id-common')，
// 这里直接 import 它的辅助方法来定制 checkToken 行为。
import { setMockCheckToken, resetMockCheckToken } from './stubs/uni-id-common.js'

const TASK_CO_PATH = '../uniCloud-alipay/cloudfunctions/task-co/index.obj.js'

let taskCo

beforeEach(async () => {
  // 让顶层 const db = uniCloud.database() 在每个 case 重新执行，避免串扰
  vi.resetModules()
  const mod = await import(TASK_CO_PATH)
  taskCo = mod.default || mod
  resetMockCheckToken()
})

function buildCtx(overrides = {}) {
  return {
    db: globalThis.uniCloud.database(),
    getClientInfo: () => ({ platform: 'web', os: 'mac', deviceId: 'test-device' }),
    getUniIdToken: () => 'mock-uid-001',
    getParams: () => [],
    getHttpInfo: () => ({ body: '{}' }),
    userInfo: { uid: 'mock-uid-001' },
    ...overrides
  }
}

describe('task-co _before', () => {
  test('缺少 token 时抛 TOKEN_INVALID', async () => {
    const ctx = buildCtx({ getUniIdToken: () => null })
    await expect(taskCo._before.call(ctx)).rejects.toMatchObject({
      errCode: 'TOKEN_INVALID'
    })
  })

  test('token 校验失败时抛对应错误', async () => {
    setMockCheckToken(async () => ({ errCode: 'TOKEN_EXPIRED', errMsg: 'expired' }))
    const ctx = buildCtx()
    await expect(taskCo._before.call(ctx)).rejects.toMatchObject({
      errCode: 'TOKEN_EXPIRED'
    })
  })

  test('token 有效时把 uid 挂到 this.userInfo', async () => {
    const ctx = buildCtx()
    await taskCo._before.call(ctx)
    expect(ctx.userInfo).toEqual({ uid: 'mock-uid-001' })
    expect(ctx.db).toBeDefined()
  })
})

describe('task-co getTaskList', () => {
  test('缺少 project_id 返回 PARAM_ERROR', async () => {
    const ctx = buildCtx()
    const res = await taskCo.getTaskList.call(ctx, {})
    expect(res).toMatchObject({ errCode: 'PARAM_ERROR' })
  })

  test('正常查询返回列表与分页元信息', async () => {
    const fakeTasks = [
      { _id: 't1', title: '任务1', status: 0 },
      { _id: 't2', title: '任务2', status: 1 }
    ]
    const collection = createCollectionMock({
      get: { data: fakeTasks },
      count: { total: 2 }
    })
    installDatabaseMock({ defaultCollection: collection })

    const ctx = buildCtx({ db: globalThis.uniCloud.database() })
    const res = await taskCo.getTaskList.call(ctx, {
      project_id: 'p1',
      pageId: 2,
      pageSize: 5
    })

    expect(res.errCode).toBe(0)
    expect(res.data.list).toEqual(fakeTasks)
    expect(res.data.total).toBe(2)
    expect(res.data.pageId).toBe(2)
    expect(res.data.pageSize).toBe(5)

    // 校验分页参数被正确传递
    expect(collection.__calls.skip).toContainEqual([5]) // (2-1) * 5
    expect(collection.__calls.limit).toContainEqual([5])

    // 校验 where 条件
    const lastWhere = collection.__calls.where[collection.__calls.where.length - 1][0]
    expect(lastWhere).toMatchObject({ project_id: 'p1' })
  })

  test('附带 status / assignee 时拼接到 where 条件', async () => {
    const collection = createCollectionMock({
      get: { data: [] },
      count: { total: 0 }
    })
    installDatabaseMock({ defaultCollection: collection })

    const ctx = buildCtx({ db: globalThis.uniCloud.database() })
    await taskCo.getTaskList.call(ctx, {
      project_id: 'p1',
      status: 2,
      assignee: 'user-x'
    })

    const where = collection.__calls.where[0][0]
    expect(where).toEqual({ project_id: 'p1', status: 2, assignee: 'user-x' })
  })
})
