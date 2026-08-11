import type { navigation as enNavigation } from "../en/navigation";

export const navigation = {
  home: "Trang chủ",
  dashboard: "Bảng điều khiển",
  settings: "Cài đặt",
  profile: "Hồ sơ",
  logout: "Đăng xuất",
} as const satisfies typeof enNavigation;
