export interface TagProps {
  title: string;
  name: string;
  fullPath: string;
  query?: Record<string, string | number | boolean | string[] | number[]>;
}

export interface TabBarState {
  tagList: TagProps[];
  cacheTabList: Set<string>;
}
