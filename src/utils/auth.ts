const TOKEN_KEY = 'xia_token';
const LEGACY_TOKEN_KEY = 'xia_token';

// 统一使用 sessionStorage：浏览器关闭后自动失效，降低长期泄露风险。
const getStorage = () => {
  return window.sessionStorage;
};

const isLogin = () => {
  return !!getStorage().getItem(TOKEN_KEY);
};

const getToken = () => {
  const currentToken = getStorage().getItem(TOKEN_KEY);
  if (currentToken) {
    return currentToken;
  }

  // 兼容一次性迁移：把历史 localStorage token 迁移到 sessionStorage。
  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (legacyToken) {
    getStorage().setItem(TOKEN_KEY, legacyToken);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    return legacyToken;
  }
  return '';
};

const setToken = (token: string) => {
  getStorage().setItem(TOKEN_KEY, token);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};

const clearToken = () => {
  getStorage().removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
};

export { isLogin, getToken, setToken, clearToken };
