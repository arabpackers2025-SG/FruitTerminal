/** Who may see contact details. Phase 1 has no login, so every visitor is anonymous
    and contact details are masked. Phase 3 replaces `viewerCanSeeContacts` with the
    subscription check. */
export type Viewer = { plan: "ANON" | "FREE" | "SELLER_PRO" | "BUYER_PRO" | "ADMIN" };

export function getViewer(): Viewer {
  return { plan: "ANON" };
}

export function viewerCanSeeContacts(v: Viewer) {
  return v.plan === "SELLER_PRO" || v.plan === "BUYER_PRO" || v.plan === "ADMIN";
}

export function maskPhone(phone: string | null | undefined) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "•••";
  return phone.slice(0, Math.min(5, phone.length - 4)).replace(/\d/g, (d, i) => (i < 3 ? d : "•")) + " ••• " + digits.slice(-2) + "••";
}

export function maskEmail(email: string | null | undefined) {
  if (!email) return null;
  const [user, domain] = email.split("@");
  if (!domain) return "•••";
  return user.slice(0, 1) + "•••@" + domain;
}

export function maskWebsite(url: string | null | undefined) {
  if (!url) return null;
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    const tld = host.slice(host.lastIndexOf("."));
    return host.slice(0, 2) + "•••" + tld;
  } catch {
    return "•••";
  }
}
