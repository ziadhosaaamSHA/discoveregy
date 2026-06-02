const CHAT_HIDDEN_PREFIXES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/admin/login",
  "/admin",
  "/tourist/pay",
  "/tourist/plans",
  "/tourist/create-plan",
  "/tourist/available-guides",
  "/guide/home",
  "/guide/requests",
  "/available-guides",
  "/requests",
  "/chats",
  "/notifications",
];

export function shouldHideFloatingChat(pathname) {
  return CHAT_HIDDEN_PREFIXES.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}
