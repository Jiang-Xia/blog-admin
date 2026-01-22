import type { DirectiveBinding } from 'vue';
import { useUserStore } from '@/store';

/**
 * 权限指令，支持两种模式：
 * 1. 角色模式：v-permission="['admin', 'user']"
 * 2. 权限码模式：v-permission="'user:create'" 或 v-permission="['user:create', 'user:edit']"
 */
function checkPermission(el: HTMLElement, binding: DirectiveBinding) {
  const { value } = binding;
  const userStore = useUserStore();
  const { role, privileges } = userStore;

  if (!value) {
    throw new Error(
      `需要权限配置！使用方式：v-permission="['admin']" 或 v-permission="'user:create'"`,
    );
  }

  let hasPermission = false;

  // 如果是字符串，转换为数组
  const permissionValues = Array.isArray(value) ? value : [value];

  if (permissionValues.length === 0) {
    return;
  }

  // 判断是角色模式还是权限码模式
  // 如果包含 ':' 则为权限码模式，否则为角色模式
  const isPrivilegeCodeMode = permissionValues.some(
    (v) => typeof v === 'string' && v.includes(':'),
  );

  if (isPrivilegeCodeMode) {
    // 权限码模式：检查用户是否拥有任意一个权限码
    hasPermission = permissionValues.some((code) => privileges.includes(code));
  } else {
    // 角色模式：检查用户角色是否匹配
    hasPermission = permissionValues.includes(role);
  }

  // 如果没有权限，移除元素
  if (!hasPermission && el.parentNode) {
    el.parentNode.removeChild(el);
  }
}

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
  updated(el: HTMLElement, binding: DirectiveBinding) {
    checkPermission(el, binding);
  },
};
