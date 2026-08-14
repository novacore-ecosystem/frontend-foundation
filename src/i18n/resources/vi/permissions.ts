import type { permissions as enPermissions } from "../en/permissions";

export const permissions = {
  root: "Toàn quyền hệ thống",
  user: "Người dùng nền tảng",
  categories: {
    role: "Vai trò",
    permission: "Quyền hạn",
    product: "Sản phẩm",
    inventory: "Tồn kho",
    warehouse: "Kho hàng",
    order: "Đơn hàng",
    audit: "Nhật ký kiểm tra",
    notification: "Thông báo",
    users: "Quản lý người dùng",
    tenant: "Tenant",
    system: "Hệ thống",
  },
} as const satisfies typeof enPermissions;
