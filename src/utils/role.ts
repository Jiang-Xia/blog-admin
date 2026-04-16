type RoleInput = string | number | null | undefined;

// 统一角色值格式：仅做去空格，严格以后端角色表值为准。
const normalizeRoleValue = (value: RoleInput): string => {
  if (value === null || value === undefined) {
    return '';
  }
  const raw = String(value).trim();
  return raw || '';
};

export const normalizeRole = (value: RoleInput): string => normalizeRoleValue(value);

// 严格模式：仅从 roles[].id 收集角色，用于路由鉴权。
export const collectNormalizedRoles = (
  roles: Array<Record<string, unknown>> | undefined,
): string[] => {
  const roleSet = new Set<string>();
  const pushRole = (input: RoleInput) => {
    const normalized = normalizeRole(input);
    if (normalized) {
      roleSet.add(normalized);
    }
  };

  if (Array.isArray(roles)) {
    roles.forEach((item) => {
      pushRole(item.id as RoleInput);
    });
  }

  return Array.from(roleSet);
};

export const hasAnyRole = (
  requiredRoles: string[] | undefined,
  roles: Array<Record<string, unknown>> | undefined,
): boolean => {
  // 未配置角色限制时默认放行。
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }
  const normalizedRequired = requiredRoles.map((v) => normalizeRole(v));
  if (normalizedRequired.includes('*')) {
    return true;
  }
  const currentRoles = collectNormalizedRoles(roles);
  return normalizedRequired.some((required) => currentRoles.includes(required));
};
