/**
 * 数据库链式调用 Mock 助手。
 *
 * uniCloud 的 db.collection().where().orderBy().skip().limit().get() 这种链式 API，
 * 用 Proxy 让"任意中间链"都返回自身，只在终结方法（get/count/add/update/remove）返回数据。
 *
 * 用法：
 *   const collection = createCollectionMock({
 *     get: { data: [...] },
 *     count: { total: 5 },
 *     add: { id: 'xxx' }
 *   })
 *   // 然后塞给 uniCloud.database().collection 的实现
 */
import { vi } from 'vitest'

const TERMINAL_METHODS = new Set(['get', 'count', 'add', 'update', 'remove', 'end'])

export function createCollectionMock(terminalResults = {}) {
  const calls = {
    where: [],
    orderBy: [],
    skip: [],
    limit: [],
    doc: [],
    add: [],
    update: [],
    remove: [],
    project: [],
    sort: [],
    match: [],
    lookup: [],
    addFields: []
  }

  const handler = {
    get(target, prop) {
      // 短路：避免 Proxy 把内部属性也当成方法
      if (prop === '__calls' || prop === 'then') return target[prop]
      if (TERMINAL_METHODS.has(prop)) {
        const fn = vi.fn(async (...args) => {
          if (calls[prop]) calls[prop].push(args)
          return terminalResults[prop] ?? { data: [] }
        })
        return fn
      }
      return vi.fn((...args) => {
        if (calls[prop]) calls[prop].push(args)
        return chain
      })
    },
    set(target, prop, value) {
      target[prop] = value
      return true
    }
  }

  const target = { __calls: calls }
  const chain = new Proxy(target, handler)
  return chain
}

/**
 * 把 mock collection 装到 uniCloud.database 上。
 * 不同集合可以用 collectionsByName 区分；不区分时所有 collection() 调用都返回同一个 mock。
 */
export function installDatabaseMock({ collectionsByName, defaultCollection } = {}) {
  const def = defaultCollection ?? createCollectionMock()
  globalThis.uniCloud.database = () => ({
    command: {
      remove: () => ({ __op: 'remove' }),
      aggregate: {
        gte: (v) => ({ __op: 'gte', v }),
        lte: (v) => ({ __op: 'lte', v }),
        arrayElemAt: (args) => ({ __op: 'arrayElemAt', args })
      }
    },
    collection: (name) => {
      if (collectionsByName && collectionsByName[name]) {
        return collectionsByName[name]
      }
      return def
    }
  })
  return { defaultCollection: def, collectionsByName: collectionsByName || {} }
}
