export function safeRedirect(path) {
  if (path && path.startsWith("/") && !path.startsWith("//")) return path;
  return null;
}

export function dashboardPathFor(role) {
  const r = ["admin", "vendor", "customer"].includes(role) ? role : "customer";
  return `/dashboard/${r}`;
}
