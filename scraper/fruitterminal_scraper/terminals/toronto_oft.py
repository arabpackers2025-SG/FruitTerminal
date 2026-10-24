"""Ontario Food Terminal (Toronto). Directory of warehouse tenants at
https://www.oftb.com/directory, each linking to /sellers/<slug> with
Phone, Fax, E-mail Address, Website and a product list."""
import re
from ..http import get
from ..models import MemberRecord

SLUG = "toronto-ontario-food-terminal"
BASE = "https://www.oftb.com"
DIRECTORY = f"{BASE}/directory"

LABELS = {
    "phone": re.compile(r"phone\s*:\s*([\d\-\s().+]{7,})", re.I),
    "email": re.compile(r"e-?mail(?: address)?\s*:\s*([\w.+-]+@[\w.-]+\.\w+)", re.I),
    "website": re.compile(r"website\s*:\s*((?:https?://)?[\w.-]+\.\w+[^\s]*)", re.I),
}
PRODUCTS = re.compile(r"our products include\s*:?\s*(.+?)(?:\n\n|$)", re.I | re.S)


def _is_business_email(addr: str) -> bool:
    # Keep info@/sales@/office@ style and company-domain addresses.
    # Drop obviously personal mailboxes on consumer providers.
    local, _, domain = addr.lower().partition("@")
    consumer = {"gmail.com", "yahoo.com", "yahoo.ca", "hotmail.com", "outlook.com", "rogers.com", "bell.net", "sympatico.ca", "icloud.com"}
    if domain in consumer:
        return local in {"info", "sales", "office", "orders", "order", "contact", "admin"}
    return True


def _profile(url: str, name: str) -> MemberRecord:
    page = get(url)
    text = page.get_all_text(separator="\n", strip=True)
    rec = MemberRecord(
        name=name,
        source=f"terminal:{SLUG}",
        source_url=url,
        terminal_slug=SLUG,
        country="CA",
        city="Toronto",
        raw={"html_title": str(page.css("title::text").get() or "")},
    )
    m = LABELS["phone"].search(text)
    if m:
        rec.phone = re.sub(r"\s+", " ", m.group(1)).strip(" .")
    m = LABELS["email"].search(text)
    if m and _is_business_email(m.group(1)):
        rec.email = m.group(1)
    m = LABELS["website"].search(text)
    if m:
        site = m.group(1).rstrip(".,")
        rec.website = site if site.startswith("http") else f"http://{site}"
    m = PRODUCTS.search(text)
    if m:
        rec.products = re.sub(r"\s+", " ", m.group(1)).strip()[:2000]
    # First paragraph after the heading is the description; keep a short cut.
    paras = [p for p in text.split("\n") if len(p) > 80]
    if paras:
        rec.raw["description"] = paras[0][:600]
    return rec


def scrape() -> list[MemberRecord]:
    page = get(DIRECTORY)
    links = page.css('a[href^="/sellers/"]')
    seen: dict[str, str] = {}
    for a in links:
        href = a.attrib.get("href", "")
        name = a.get_all_text(strip=True)
        if href and name and href not in seen:
            seen[href] = name
    records = []
    for href, name in seen.items():
        try:
            records.append(_profile(BASE + href, name))
        except Exception as e:  # keep going; one bad profile shouldn't stop the run
            records.append(MemberRecord(name=name, source=f"terminal:{SLUG}", source_url=BASE + href,
                                        terminal_slug=SLUG, country="CA", city="Toronto",
                                        raw={"error": str(e)}))
    return records
