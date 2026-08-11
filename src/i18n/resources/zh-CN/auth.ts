import type { auth as enAuth } from "../en/auth";

export const auth = {
  login: "登录",
  logout: "退出登录",
  email: "邮箱",
  password: "密码",
  forgotPassword: "忘记密码？",
  rememberMe: "记住我",
  signIn: "登录",
  signOut: "退出",
} as const satisfies typeof enAuth;
