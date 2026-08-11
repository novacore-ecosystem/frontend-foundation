import type { auth as enAuth } from "../en/auth";

export const auth = {
  login: "Đăng nhập",
  logout: "Đăng xuất",
  email: "Email",
  password: "Mật khẩu",
  forgotPassword: "Quên mật khẩu?",
  rememberMe: "Ghi nhớ đăng nhập",
  signIn: "Đăng nhập",
  signOut: "Đăng xuất",
} as const satisfies typeof enAuth;
