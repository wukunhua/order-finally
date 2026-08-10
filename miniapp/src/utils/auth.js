import http from './request';
import { getToken, setToken, setUser, clearAuth } from './storage';

// 重新导出存储辅助,保持既有 import { getUser/clearAuth } from 'auth' 可用
export { getToken, setToken, getUser, setUser, clearAuth } from './storage';

function wxLoginCode() {
  return new Promise((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => (res.code ? resolve(res.code) : reject(new Error('未获取到 code'))),
      fail: reject,
    });
  });
}

// 真实微信登录: code -> 后端 code2session -> openid
async function wxLogin() {
  const code = await wxLoginCode();
  const data = await http.post('/auth/wx-login', { code });
  setToken(data.token);
  setUser(data.user);
  return data.token;
}

// 开发兜底:无需微信凭证,直接造一个本地测试用户
export async function mockLogin(openid) {
  const data = await http.post('/auth/mock-login', { openid: openid || 'mock_openid_demo' });
  setToken(data.token);
  setUser(data.user);
  return data.token;
}

// 确保已登录:用 /auth/profile 验证缓存 token 有效性,失效则重新登录
export async function ensureLogin() {
  const savedToken = getToken();
  if (savedToken) {
    try {
      // 调 profile 接口验证 token 是否仍有效,同时同步最新的用户信息(角色/昵称等可能被管理端修改)
      const profile = await http.get('/auth/profile', null, { silent: true });
      setUser(profile);
      return savedToken;
    } catch (e) {
      const msg = (e && e.message) || '';
      // 未登录/过期/用户不存在 => 清除并重新登录
      if (/未登录|过期|不存在/.test(msg)) {
        clearAuth();
      } else {
        // 网络错误等不可恢复的异常,仍用旧 token 尝试(避免断网时误清除)
        return savedToken;
      }
    }
  }

  try {
    return await wxLogin();
  } catch (e) {
    const msg = (e && e.message) || '';
    // 账号被禁用 / 无权限 等情况不兜底,保持拦截
    if (/禁用|无权限|未登录/.test(msg)) throw e;
    // 其它失败(如后端未配置微信 AppID/Secret)在开发期用 mock 兜底
    // eslint-disable-next-line no-console
    console.warn('[auth] 微信登录失败,回退到 mock 登录:', msg);
    return await mockLogin();
  }
}
