import { defineStore } from 'pinia';
import { LoginData } from '@/api/user';
import { setToken, clearToken } from '@/utils/auth';
import { removeRouteListener } from '@/utils/route-listener';
import { userLogin } from '@/api/login';
// import { UserState } from './types';
import useAppStore from '../app';

export interface AnyPropName {
  [propName: string]: any;
}
const useUserStore = defineStore('user', {
  state: (): AnyPropName => ({
    nickname: '',
    mobile: '',
  }),

  getters: {
    userInfo(state) {
      return { ...state };
    },
  },

  actions: {
    switchRoles() {
      return new Promise((resolve) => {
        this.role = this.role === 'user' ? 'admin' : 'user';
        resolve(this.role);
      });
    },
    // Set user's information
    setInfo(partial: any) {
      this.$patch(partial);
    },
    // Reset user's information
    resetInfo() {
      this.$reset();
    },

    // Get user's information
    async info(info: any) {
      this.setInfo(info);
    },

    // Login
    async login(loginForm: LoginData) {
      try {
        const res = await userLogin({
          mobile: loginForm.username,
          password: loginForm.password,
        });
        setToken(res.info.token);
        this.info(res.info.user);
      } catch (err) {
        clearToken();
        throw err;
      }
    },
    logoutCallBack() {
      const appStore = useAppStore();
      this.resetInfo();
      clearToken();
      removeRouteListener();
      appStore.clearServerMenu();
    },
    // Logout
    async logout() {
      try {
        // await userLogout();
      } finally {
        this.logoutCallBack();
      }
    },
  },
});

export default useUserStore;
