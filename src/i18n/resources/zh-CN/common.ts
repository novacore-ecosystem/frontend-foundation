import type { common as enCommon } from "../en/common";

/** Simplified Chinese translation of `resources/en/common.ts`. Kept shape-complete via `satisfies typeof enCommon`. */
export const common = {
  actions: {
    create: "新建",
    edit: "编辑",
    delete: "删除",
    save: "保存",
    cancel: "取消",
    close: "关闭",
    search: "搜索",
    reset: "重置",
    confirm: "确认",
    apply: "应用",
    refresh: "刷新",
    view: "查看",
    back: "返回",
    next: "下一步",
    submit: "提交",
  },
  status: {
    active: "已启用",
    inactive: "未启用",
    pending: "待处理",
    success: "成功",
    failed: "失败",
    draft: "草稿",
    archived: "已归档",
  },
  pagination: {
    next: "下一页",
    previous: "上一页",
    first: "首页",
    last: "末页",
    page: "第",
    of: "共",
    itemsPerPage: "每页条数",
  },
  table: {
    empty: "暂无数据",
    loading: "加载中…",
    noResults: "未找到结果",
  },
  welcome: "欢迎，{{name}}",
} as const satisfies typeof enCommon;
