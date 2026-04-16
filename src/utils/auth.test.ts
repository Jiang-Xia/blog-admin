import { beforeEach, describe, expect, it } from 'vitest';
import { clearToken, getToken, isLogin, setToken } from './auth';

describe('auth token storage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it('stores token in sessionStorage', () => {
    setToken('token-1');
    expect(sessionStorage.getItem('xia_token')).toBe('token-1');
    expect(localStorage.getItem('xia_token')).toBeNull();
    expect(getToken()).toBe('token-1');
    expect(isLogin()).toBe(true);
  });

  it('migrates legacy token from localStorage', () => {
    localStorage.setItem('xia_token', 'legacy-token');
    expect(getToken()).toBe('legacy-token');
    expect(sessionStorage.getItem('xia_token')).toBe('legacy-token');
    expect(localStorage.getItem('xia_token')).toBeNull();
  });

  it('clears token from both storages', () => {
    localStorage.setItem('xia_token', 'legacy-token');
    setToken('token-2');
    clearToken();
    expect(getToken()).toBe('');
    expect(isLogin()).toBe(false);
  });
});
