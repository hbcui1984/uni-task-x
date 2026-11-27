/**
 * uni-id-common 的测试替身。
 *
 * 通过 setup.js 中的 Module._resolveFilename hook，
 * 云函数里 require('uni-id-common') 会被重定向到这里。
 *
 * 注意：本文件可能被以两种方式加载（ESM import / CJS require），
 * 因此 mockCheckToken 状态放在 globalThis 上以确保两份副本共享同一状态。
 */
function getStore() {
  if (!globalThis.__uniIdCommonStubStore) {
    globalThis.__uniIdCommonStubStore = {
      checkToken: async (token) => ({ uid: token, errCode: 0 })
    }
  }
  return globalThis.__uniIdCommonStubStore
}

function createInstance() {
  return {
    checkToken: (token) => getStore().checkToken(token)
  }
}

function setMockCheckToken(fn) {
  getStore().checkToken = fn
}

function resetMockCheckToken() {
  getStore().checkToken = async (token) => ({ uid: token, errCode: 0 })
}

module.exports = { createInstance, setMockCheckToken, resetMockCheckToken }
