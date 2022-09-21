import { defineStore } from 'pinia';
import { LoginData } from '@/api/user';
import { setToken, clearToken, getToken } from '@/utils/auth';
import { removeRouteListener } from '@/utils/route-listener';
import { userInfo, userLogin } from '@/api/login';
// import { UserState } from './types';
import { rsaEncrypt } from '@/utils/crypto';
import useAppStore from '../app';

interface UserState {
  nickname: string;
  mobile: string;
  token: string;
  id: number;
  role: string;
  avatar: string;
  homepage: string;
  intro: string;
}
/* 
  使用 const userStore = useUserStore(); userStore.id 
  state中显示声明了才能使用
*/

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    nickname: '',
    mobile: '',
    token: getToken(),
    id: 0,
    role: '',
    avatar: '',
    homepage: '',
    intro: '',
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
    setInfo(partial: Partial<UserState>) {
      this.$patch(partial);
    },
    // Reset user's information
    resetInfo() {
      this.$reset();
    },

    // Get user's information
    async info(info: Partial<UserState>) {
      this.setInfo(info);
    },

    // Login
    async login(loginForm: LoginData) {
      try {
        const res = await userLogin({
          mobile: loginForm.username,
          password: rsaEncrypt(loginForm.password),
          admin: true,
        });
        const user = res.info.user as UserState;
        setToken(res.info.token);
        this.$state.token = res.info.token;
        this.info(user);
      } catch (err) {
        clearToken();
        throw err;
      }
    },
    // 使用ticket时直接跳转登录步骤
    async ticketLogin(token: string) {
      setToken(token);
      this.$state.token = token;
      await this.getInfo();
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
    async getInfo() {
      try {
        const res = await userInfo();
        this.info(res);
      } catch (err) {
        clearToken();
        throw err;
      }
    },
  },
});

export default useUserStore;
