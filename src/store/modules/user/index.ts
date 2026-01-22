import { defineStore } from 'pinia';
import { type LoginData, type MobileLoginData, type EmailLoginData } from '@/api/user';
import { setToken, clearToken, getToken } from '@/utils/auth';
import { removeRouteListener } from '@/utils/route-listener';
import { userInfo, userLogin } from '@/api/login';
// import { UserState } from './types';
import { rsaEncrypt } from '@/utils/crypto';
import useAppStore from '../app';

interface UserState {
  email: string;
  nickname: string;
  mobile: string;
  token: string;
  id: number;
  role: string;
  avatar: string;
  homepage: string;
  intro: string;
  roles: any[];
  privileges: string[];
}
/*
  使用 const userStore = useUserStore(); userStore.id
  state中显示声明了才能使用
*/

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    email: '',
    nickname: '',
    mobile: '',
    token: getToken(),
    id: 0,
    role: '',
    avatar: '',
    homepage: '',
    intro: '',
    roles: [],
    privileges: [],
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
        // 判断是手机号登录还是邮箱登录
        if ('username' in loginForm && 'authCode' in loginForm) {
          // 手机号登录
          const mobileLogin = loginForm as MobileLoginData;
          const res = await userLogin(
            {
              mobile: mobileLogin.username,
              authCode: mobileLogin.authCode,
              password: rsaEncrypt(mobileLogin.password),
              admin: true,
            },
            'mobile',
          );
          const user = res.info.user as UserState;
          setToken(res.info.token);
          this.$state.token = res.info.token;
          this.info(user);
        } else if ('email' in loginForm && 'verificationCode' in loginForm) {
          // 邮箱登录
          const emailLogin = loginForm as EmailLoginData;
          const res = await userLogin(
            {
              email: emailLogin.email,
              verificationCode: emailLogin.verificationCode,
              password: rsaEncrypt(emailLogin.password),
              admin: true,
            },
            'email',
          );
          const user = res.info.user as UserState;
          setToken(res.info.token);
          this.$state.token = res.info.token;
          this.info(user);
        } else {
          throw new Error('Invalid login data');
        }
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
        // 提取所有角色的权限码
        if (res.roles && Array.isArray(res.roles)) {
          const privilegeCodes: string[] = [];
          res.roles.forEach((role: any) => {
            if (role.privileges && Array.isArray(role.privileges)) {
              role.privileges.forEach((privilege: any) => {
                if (privilege.privilegeCode && !privilegeCodes.includes(privilege.privilegeCode)) {
                  privilegeCodes.push(privilege.privilegeCode);
                }
              });
            }
          });
          this.privileges = privilegeCodes;
        }
      } catch (err) {
        clearToken();
        throw err;
      }
    },
  },
});

export default useUserStore;
