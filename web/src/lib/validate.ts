export function clean(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}
export function isEmail(s: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
}
export function domainOf(urlOrEmail: string | null | undefined): string | null {
  if (!urlOrEmail) return null;
  try {
    if (urlOrEmail.includes("@")) return urlOrEmail.split("@")[1].toLowerCase().replace(/^www\./, "");
    const h = new URL(urlOrEmail.startsWith("http") ? urlOrEmail : `https://${urlOrEmail}`).hostname;
    return h.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}
