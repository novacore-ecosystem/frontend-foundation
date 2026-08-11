import type { admin as enAdmin } from "../en/admin";

export const admin = {
  entities: {
    users: "Người dùng",
    roles: "Vai trò",
    permissions: "Quyền hạn",
    positions: "Chức vụ",
    products: "Sản phẩm",
    variants: "Biến thể",
    inventory: "Tồn kho",
    warehouses: "Kho hàng",
    orders: "Đơn hàng",
    payments: "Thanh toán",
    shipments: "Vận chuyển",
    promotions: "Khuyến mãi",
    settings: "Cài đặt",
  },
} as const satisfies typeof enAdmin;
