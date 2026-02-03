<template>
  <div class="tab-bar-container">
    <a-affix ref="affixRef" :offset-top="offsetTop">
      <div class="tab-bar-box">
        <div class="tab-bar-scroll">
          <div class="tags-wrap">
            <span
              v-for="(tag, index) in tagList"
              :key="tag.fullPath"
              class="arco-tag arco-tag-size-medium arco-tag-checked"
              :class="{ 'link-activated': tag.fullPath === route.fullPath }"
              @click="goto(tag)"
            >
              <span class="tag-link">
                {{ t(tag.title) }}
              </span>
              <span
                class="arco-icon-hover arco-tag-icon-hover arco-icon-hover-size-medium arco-tag-close-btn"
                @click.stop="tagClose(tag, index)"
              >
                <icon-close />
              </span>
            </span>
          </div>
        </div>
        <div class="tag-bar-operation">
          <a-dropdown trigger="hover" @select="closeSelect">
            <a-tag color="red">{{ t('common.tabBar.close') }}</a-tag>
            <template #content>
              <a-doption value="current">{{ t('common.tabBar.closeCurrent') }}</a-doption>
              <a-doption value="all">{{ t('common.tabBar.closeAll') }}</a-doption>
            </template>
          </a-dropdown>
        </div>
      </div>
    </a-affix>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import type { RouteLocationNormalized } from 'vue-router';
  import { listenerRouteChange } from '@/utils/route-listener';
  import { useAppStore, useTabBarStore } from '@/store';
  import type { TagProps } from '@/store/modules/tab-bar/types';
  import { useI18n } from 'vue-i18n';
  import { Message } from '@arco-design/web-vue';

  const { t } = useI18n();
  const appStore = useAppStore();
  const tabBarStore = useTabBarStore();

  const router = useRouter();
  const route = useRoute();
  const affixRef = ref();
  const tagList = computed(() => {
    return tabBarStore.getTabList;
  });
  const offsetTop = computed(() => {
    return appStore.navbar ? 60 : 0;
  });

  watch(
    () => appStore.navbar,
    () => {
      affixRef.value.updatePosition();
    },
  );
  listenerRouteChange((route: RouteLocationNormalized) => {
    if (!route.meta.noAffix && !tagList.value.some((tag) => tag.fullPath === route.fullPath)) {
      tabBarStore.updateTabList(route);
    }
  }, true);
  const tagClose = (tag: TagProps, idx: number) => {
    if (tag.fullPath === '/dashboard/workplace') {
      Message.warning(t('common.tabBar.fixedPageCannotClose'));
      return;
    }
    tabBarStore.deleteTag(idx, tag);
    console.log(idx, tag);
    if (idx === tagList.value.length || route.fullPath === tag.fullPath) {
      const latest = tagList.value[tagList.value.length - 1];
      // console.log('closeTab:', latest);
      router.push({ name: latest?.name });
    }
  };
  const goto = (tag: any) => {
    router.push({ ...tag });
  };
  console.log(tagList.value);
  const closeSelect = (val: string) => {
    // console.log(val)
    if (val === 'current') {
      const idx = tagList.value.findIndex((tag) => tag.fullPath === route.fullPath);
      tagClose(tagList.value[idx] as TagProps, idx);
    } else if (val === 'all') {
      tabBarStore.deleteAllTag();
      router.replace({ name: 'Workplace' });
    }
  };
</script>

<style scoped lang="less">
  .tab-bar-container {
    position: relative;
    background-color: var(--color-bg-2);

    .tab-bar-box {
      display: flex;
      padding: 0 0 0 20px;
      background-color: var(--color-bg-2);
      border-bottom: 1px solid var(--color-border);

      .tab-bar-scroll {
        flex: 1;
        height: 32px;
        overflow: hidden;

        .tags-wrap {
          height: 42px;
          padding: 4px 0;
          overflow-x: auto;
          white-space: nowrap;

          :deep(.arco-tag) {
            display: inline-flex;
            align-items: center;
            margin-right: 6px;
            cursor: pointer;

            &:first-child {
              .arco-tag-close-btn {
                display: none;
              }
            }
          }
        }
      }
    }

    .tag-bar-operation {
      width: 100px;
      height: 32px;
      padding-top: 4px;
      padding-right: 20px;
      text-align: right;
    }
  }

  .tag-link {
    color: var(--color-text-2);
    text-decoration: none;
  }

  .link-activated {
    color: rgb(var(--link-6));

    .tag-link {
      color: rgb(var(--link-6));
    }

    & + .arco-tag-close-btn {
      color: rgb(var(--link-6));
    }
  }

  :deep(.arco-affix) {
    z-index: 90;
    overflow-x: auto;
    background-color: var(--color-bg-2);
  }
</style>
