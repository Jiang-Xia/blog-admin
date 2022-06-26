import { setToken } from '@/utils/cookie'
import { defineStore } from 'pinia'
import { readonly, toRaw, watch } from 'vue'
export interface AnyPropName {
  [propName: string]: any
}
type User = {
  id: string
  name: string
}

interface UserState {
  user: AnyPropName
  token: string
}

export const useUserStore = defineStore({
  id: 'User',
  state: (): UserState => {
    return {
      user: {},
      token: ''
    }
  },
  getters: {
    userName(): string {
      let user: AnyPropName = {}
      if (!Object.keys(this.user).length) {
        user = JSON.parse(localStorage.getItem('USER') || '{}')
      }
      return user.nickname
    }
  },
  actions: {
    // 设置用户信息
    setUser(userInfo: User) {
      this.user = userInfo
      localStorage.setItem('USER', JSON.stringify(this.user))
    },
    setToekn(token: string) {
      this.token = token
      localStorage.setItem('token', token)
    }
  }
})
