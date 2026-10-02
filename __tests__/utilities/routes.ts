import RootLayout from "../../app/_layout";
import About from "../../app/about";
import ChatLayout from "../../app/chat/_layout";
import Chat from "../../app/chat/index";
import Download from "../../app/download";
import Root from "../../app/index";
import Settings from "../../app/settings";

// 封心 AI：账号（登录/注册/改密/重置密码）路由已移除。
export default {
  "_layout": RootLayout,
  "index": Root,
  "chat/_layout": ChatLayout,
  "chat/index": Chat,
  "about": About,
  "download": Download,
  "settings": Settings,
};