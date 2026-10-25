import { getSessionUser } from "@/lib/auth";

/** Who may see contact details: anonymous and free members see masked contacts;
    paid members and admins see them in full. A company always sees its own. */
export type Viewer = {
  plan: "ANON" | "FREE" | "SELLER_PRO" | "BUYER_PRO" | "ADMIN";
  companyId: string | null;
};

export async function getViewer(): Promise<Viewer> {
  const user = await getSessionUser();
  if (!user) return { plan: "ANON", companyId: null };
  if (user.role === "ADMIN") return { plan: "ADMIN", companyId: user.companyId };
  return { plan: user.plan, companyId: user.companyId };
}

export function viewerCanSeeContacts(v: Viewer, ownerCompanyId?: string | null) {
  if (ownerCompanyId && v.companyId && ownerCompanyId === v.companyId) return true;
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
