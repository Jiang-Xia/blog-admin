/** @desc 文件模块-映射 */

export interface fileTypeListItem {
  name: string;
  value: number;
  type: string;
  icon: string;
  i18nKey: string; // 国际化key
}

// 文件分类
export const fileTypeList: fileTypeListItem[] = [
  { name: '全部', value: 0, type: '', icon: 'icon-wenjianjia', i18nKey: 'resource.fileType.all' },
  {
    name: '图片',
    value: 1,
    type: 'image',
    icon: 'icon-tupian',
    i18nKey: 'resource.fileType.image',
  },
  {
    name: '文档',
    value: 2,
    type: 'text',
    icon: 'icon-wenzhang1',
    i18nKey: 'resource.fileType.document',
  },
  {
    name: '视频',
    value: 3,
    type: 'video',
    icon: 'icon-shipin',
    i18nKey: 'resource.fileType.video',
  },
  {
    name: '音频',
    value: 4,
    type: 'audio',
    icon: 'icon-yinpin',
    i18nKey: 'resource.fileType.audio',
  },
  {
    name: '其他',
    value: 5,
    type: 'application',
    icon: 'icon-baocun',
    i18nKey: 'resource.fileType.application',
  },
];

export interface FileExtendNameIconMap {
  [key: string]: string;
}

// 文件类型图标 Map 映射
export const fileExtendNameIconMap: FileExtendNameIconMap = {
  mp3: 'file-music',
  mp4: 'file-video',
  dir: 'file-dir',
  ppt: 'file-ppt',
  doc: 'file-wps',
  docx: 'file-wps',
  xls: 'file-excel',
  xlsx: 'file-excel',
  txt: 'file-txt',
  rar: 'file-rar',
  zip: 'file-zip',
  html: 'file-html',
  css: 'file-css',
  js: 'file-js',
  other: 'file-other', // 未知文件
};

// 图片类型
export const imageTypeList = ['jpg', 'png', 'gif', 'jpeg'];

// WPS、Office文件类型
export const officeFileType = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx'];
