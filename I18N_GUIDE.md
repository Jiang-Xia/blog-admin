# 国际化使用指南

## 概述

本项目已完成中英文国际化配置，支持动态切换语言。国际化基于 `vue-i18n` 实现。

## 目录结构

```
src/locale/
├── index.ts                 # 国际化配置入口
├── zh-CN.ts                 # 中文主配置
├── en-US.ts                 # 英文主配置
├── zh-CN/                   # 通用配置文件夹
│   ├── common.ts           # 通用文本（按钮、表单、表格等）
│   └── settings.ts         # 设置相关
└── en-US/                   # 通用配置文件夹
    ├── common.ts
    └── settings.ts

src/views/                   # 各业务模块国际化
├── article/locale/          # 文章管理
│   ├── zh-CN.ts
│   └── en-US.ts
├── category/locale/         # 分类管理
│   ├── zh-CN.ts
│   └── en-US.ts
├── tag/locale/              # 标签管理
│   ├── zh-CN.ts
│   └── en-US.ts
├── comment/locale/          # 评论管理
│   ├── zh-CN.ts
│   └── en-US.ts
├── msgboard/locale/         # 留言板管理
│   ├── zh-CN.ts
│   └── en-US.ts
├── link/locale/             # 友链管理
│   ├── zh-CN.ts
│   └── en-US.ts
├── resource/locale/         # 资源管理
│   ├── zh-CN.ts
│   └── en-US.ts
├── user/locale/             # 用户中心
│   ├── zh-CN.ts
│   └── en-US.ts
├── system/locale/           # 系统管理（用户、角色、权限、部门、菜单）
│   ├── zh-CN.ts
│   └── en-US.ts
└── dashboard/
    ├── workplace/locale/    # 工作台
    │   ├── zh-CN.ts
    │   └── en-US.ts
    └── datascreen/locale/   # 数据大屏
        ├── zh-CN.ts
        └── en-US.ts
```

## 使用方法

### 1. 在 Vue 组件中使用

#### 选项式 API

```vue
<template>
  <div>
    <!-- 直接使用 $t -->
    <h1>{{ $t('common.button.search') }}</h1>
    
    <!-- 在属性中使用 -->
    <a-button :title="$t('common.button.add')">
      {{ $t('common.button.add') }}
    </a-button>
    
    <!-- 在表格列中使用 -->
    <a-table-column :title="$t('common.table.operation')" />
  </div>
</template>

<script>
export default {
  methods: {
    showMessage() {
      // 在 JS 中使用
      this.$message.success(this.$t('common.message.success'));
    }
  }
}
</script>
```

#### 组合式 API (Composition API)

```vue
<template>
  <div>
    <!-- 使用 $t 函数 -->
    <h1>{{ $t('common.button.search') }}</h1>
    
    <!-- 在属性中使用 -->
    <a-input :placeholder="$t('common.form.placeholder.input')" />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';

// 获取 t 函数
const { t } = useI18n();

// 在脚本中使用
const showMessage = () => {
  console.log(t('common.message.success'));
};
</script>
```

### 2. 国际化 Key 命名规范

#### 通用文本（common.*）
```
common.button.*         # 按钮文本
common.form.*           # 表单标签
common.form.placeholder.* # 表单占位符
common.table.*          # 表格列
common.status.*         # 状态文本
common.message.*        # 消息提示
common.confirm.*        # 确认提示
common.validate.*       # 验证提示
```

#### 模块文本（模块名.*）
```
article.query.title     # 文章查询标题
article.form.title      # 文章表单字段
article.table.title     # 文章表格列
article.button.create   # 文章按钮
article.message.*       # 文章消息
article.confirm.*       # 文章确认

category.*              # 分类管理
tag.*                   # 标签管理
user.*                  # 用户管理
role.*                  # 角色管理
dept.*                  # 部门管理
menu.*                  # 菜单管理
privilege.*             # 权限管理
```

### 3. 添加新的国际化配置

#### 步骤 1：在对应的 locale 文件中添加配置

**zh-CN.ts**
```typescript
export default {
  'mymodule.title': '我的模块',
  'mymodule.button.save': '保存',
  'mymodule.message.success': '保存成功',
};
```

**en-US.ts**
```typescript
export default {
  'mymodule.title': 'My Module',
  'mymodule.button.save': 'Save',
  'mymodule.message.success': 'Save Successfully',
};
```

#### 步骤 2：在主配置文件中导入

**src/locale/zh-CN.ts**
```typescript
import localeMyModule from '@/views/mymodule/locale/zh-CN';

export default {
  // ... 其他配置
  ...localeMyModule,
};
```

**src/locale/en-US.ts**
```typescript
import localeMyModule from '@/views/mymodule/locale/en-US';

export default {
  // ... 其他配置
  ...localeMyModule,
};
```

### 4. 切换语言

语言切换通过 Navbar 右上角的语言选择器实现，会自动保存到 localStorage。

编程方式切换：
```typescript
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();

// 切换到中文
locale.value = 'zh-CN';

// 切换到英文
locale.value = 'en-US';
```

### 5. 常用国际化配置示例

#### 按钮
```vue
<a-button>{{ $t('common.button.search') }}</a-button>     <!-- 搜索 / Search -->
<a-button>{{ $t('common.button.reset') }}</a-button>      <!-- 重置 / Reset -->
<a-button>{{ $t('common.button.add') }}</a-button>        <!-- 新建 / Add -->
<a-button>{{ $t('common.button.edit') }}</a-button>       <!-- 编辑 / Edit -->
<a-button>{{ $t('common.button.delete') }}</a-button>     <!-- 删除 / Delete -->
<a-button>{{ $t('common.button.save') }}</a-button>       <!-- 保存 / Save -->
<a-button>{{ $t('common.button.cancel') }}</a-button>     <!-- 取消 / Cancel -->
```

#### 表单
```vue
<a-form-item :label="$t('common.form.title')">             <!-- 标题 / Title -->
  <a-input :placeholder="$t('common.form.placeholder.input')" />
</a-form-item>

<a-form-item :label="$t('common.form.status')">            <!-- 状态 / Status -->
  <a-select :placeholder="$t('common.form.placeholder.select')" />
</a-form-item>
```

#### 表格
```vue
<a-table-column :title="$t('common.table.id')" />          <!-- ID / ID -->
<a-table-column :title="$t('common.table.createTime')" />  <!-- 创建时间 / Create Time -->
<a-table-column :title="$t('common.table.operation')" />   <!-- 操作 / Operation -->
```

#### 消息提示
```typescript
import { Message } from '@arco-design/web-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

Message.success(t('common.message.success'));              // 操作成功 / Operation Successful
Message.error(t('common.message.fail'));                    // 操作失败 / Operation Failed
Message.success(t('common.message.deleteSuccess'));        // 删除成功 / Delete Successful
```

#### 确认对话框
```typescript
import { Modal } from '@arco-design/web-vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

Modal.confirm({
  title: t('common.confirm.title'),                         // 提示 / Tips
  content: t('common.confirm.delete'),                      // 确定要删除吗？ / Are you sure to delete?
  onOk: () => {
    // 删除操作
  }
});
```

## 已配置的国际化模块

✅ 通用文本（按钮、表单、表格、状态、消息等）
✅ 文章管理
✅ 分类管理
✅ 标签管理
✅ 用户管理
✅ 角色管理
✅ 权限管理
✅ 部门管理
✅ 菜单管理
✅ 评论管理
✅ 留言板管理
✅ 友链管理
✅ 资源管理
✅ 数据大屏
✅ 登录页面
✅ 工作台
✅ 设置

## 注意事项

1. **一致性**：确保中英文配置的 key 完全一致
2. **命名规范**：遵循 `模块.类型.名称` 的命名规范
3. **复用性**：优先使用 common 中的通用文本，避免重复定义
4. **类型安全**：在 TypeScript 项目中，建议为国际化 key 创建类型定义
5. **测试**：添加新配置后，务必在中英文环境下都进行测试

## 参考链接

- [Vue I18n 官方文档](https://vue-i18n.intlify.dev/)
- [Arco Design 国际化](https://arco.design/vue/docs/i18n)
