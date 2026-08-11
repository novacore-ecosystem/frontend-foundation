import type { navigation as enNavigation } from "../en/navigation";

export const navigation = {
  home: "首页",
  dashboard: "仪表盘",
  settings: "设置",
  profile: "个人资料",
  logout: "退出登录",
} as const satisfies typeof enNavigation;
