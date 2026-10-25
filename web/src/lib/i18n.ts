import "server-only";
import { cookies } from "next/headers";

export const LOCALES = ["en", "ar", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_NAMES: Record<Locale, string> = { en: "English", ar: "العربية", es: "Español" };
export const COOKIE = "ft_lang";

export function dir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export async function getLocale(): Promise<Locale> {
  const v = (await cookies()).get(COOKIE)?.value as Locale | undefined;
  return v && LOCALES.includes(v) ? v : "en";
}

type Dict = Record<string, string>;
const en: Dict = {
  "nav.terminals": "Terminals", "nav.buyers": "Buyers", "nav.exporters": "Exporters",
  "nav.products": "Products", "nav.pricing": "Pricing",
  "cta.signin": "Sign in", "cta.list": "List your company", "cta.dashboard": "Dashboard",
  "cta.signout": "Sign out", "cta.admin": "Admin",
  "footer.tagline": "The directory of wholesale fruit terminals and the exporters that supply them.",
  "footer.operated": "Operated by Sagueny Group.",
  "footer.remove": "Remove or correct a listing", "footer.terms": "Terms and privacy",
  "footer.about": "About",
  "home.title": "Find the buyers inside every fruit terminal.",
  "home.subtitle": "Wholesale markets from Toronto to Rungis to Hunts Point, the importers who trade in them, and the exporters who can supply them. Free to browse; members get contact details.",
  "home.searchPlaceholder": "Search a buyer, product or city", "home.search": "Search",
  "home.stat.terminals": "Terminals", "home.stat.buyers": "Buyers", "home.stat.exporters": "Exporters",
  "home.board": "Terminal board", "home.allTerminals": "All terminals",
  "home.wholesalers": "{n} wholesalers", "home.wholesaler": "{n} wholesaler",
  "home.latestRequests": "Latest buy requests", "home.latestOffers": "Latest offers",
  "home.noRequests": "No open requests yet. Buyers post what they need; matching exporters are alerted.",
  "home.noOffers": "No open offers yet. Exporters post availability by product and season.",
  "home.browseTitle": "Browse by terminal",
  "home.browseBody": "Every listed terminal has a page with its location, hours and the wholesalers trading inside it.",
  "home.claimTitle": "Claim your listing",
  "home.claimBody": "Listed from public sources and marked Unclaimed? Claim it for free, correct the details, and start receiving inquiries.",
  "home.membersTitle": "Members see contacts",
  "home.membersBody": "Browsing is free with one inquiry a day. Seller Pro and Buyer Pro unlock phone, email and website on every profile.",
  "home.seePlans": "See plans",
  "lang.label": "Language",
};
const ar: Dict = {
  "nav.terminals": "الأسواق", "nav.buyers": "المشترون", "nav.exporters": "المصدّرون",
  "nav.products": "المنتجات", "nav.pricing": "الأسعار",
  "cta.signin": "تسجيل الدخول", "cta.list": "أضف شركتك", "cta.dashboard": "لوحة التحكم",
  "cta.signout": "تسجيل الخروج", "cta.admin": "الإدارة",
  "footer.tagline": "دليل أسواق الفاكهة بالجملة والمصدّرين الذين يزوّدونها.",
  "footer.operated": "تُدار بواسطة مجموعة ساجني.",
  "footer.remove": "إزالة أو تصحيح إدراج", "footer.terms": "الشروط والخصوصية",
  "footer.about": "من نحن",
  "home.title": "اعثر على المشترين داخل كل سوق فاكهة.",
  "home.subtitle": "أسواق الجملة من تورنتو إلى رنجيس إلى هانتس بوينت، والمستوردون الذين يتاجرون فيها، والمصدّرون القادرون على تزويدهم. التصفح مجاني؛ ويحصل الأعضاء على بيانات الاتصال.",
  "home.searchPlaceholder": "ابحث عن مشترٍ أو منتج أو مدينة", "home.search": "بحث",
  "home.stat.terminals": "أسواق", "home.stat.buyers": "مشترون", "home.stat.exporters": "مصدّرون",
  "home.board": "لوحة الأسواق", "home.allTerminals": "كل الأسواق",
  "home.wholesalers": "{n} تاجر جملة", "home.wholesaler": "{n} تاجر جملة",
  "home.latestRequests": "أحدث طلبات الشراء", "home.latestOffers": "أحدث العروض",
  "home.noRequests": "لا توجد طلبات مفتوحة بعد. ينشر المشترون احتياجاتهم ويُنبَّه المصدّرون المطابقون.",
  "home.noOffers": "لا توجد عروض مفتوحة بعد. ينشر المصدّرون التوافر حسب المنتج والموسم.",
  "home.browseTitle": "تصفّح حسب السوق",
  "home.browseBody": "لكل سوق مُدرَج صفحة بموقعه ومواعيده وتجّار الجملة العاملين بداخله.",
  "home.claimTitle": "طالِب بإدراجك",
  "home.claimBody": "مُدرَج من مصادر عامة وموسوم بغير مُطالَب به؟ طالِب به مجانًا وصحّح البيانات وابدأ باستقبال الاستفسارات.",
  "home.membersTitle": "الأعضاء يرون بيانات الاتصال",
  "home.membersBody": "التصفح مجاني مع استفسار واحد يوميًا. تفتح باقتا Seller Pro وBuyer Pro الهاتف والبريد والموقع في كل ملف.",
  "home.seePlans": "عرض الباقات",
  "lang.label": "اللغة",
};
const es: Dict = {
  "nav.terminals": "Terminales", "nav.buyers": "Compradores", "nav.exporters": "Exportadores",
  "nav.products": "Productos", "nav.pricing": "Precios",
  "cta.signin": "Iniciar sesión", "cta.list": "Publica tu empresa", "cta.dashboard": "Panel",
  "cta.signout": "Cerrar sesión", "cta.admin": "Administración",
  "footer.tagline": "El directorio de mercados mayoristas de fruta y los exportadores que los abastecen.",
  "footer.operated": "Operado por Sagueny Group.",
  "footer.remove": "Eliminar o corregir una ficha", "footer.terms": "Términos y privacidad",
  "footer.about": "Acerca de",
  "home.title": "Encuentra a los compradores dentro de cada terminal de fruta.",
  "home.subtitle": "Mercados mayoristas desde Toronto hasta Rungis y Hunts Point, los importadores que operan en ellos y los exportadores que pueden abastecerlos. Navegar es gratis; los miembros obtienen los datos de contacto.",
  "home.searchPlaceholder": "Busca un comprador, producto o ciudad", "home.search": "Buscar",
  "home.stat.terminals": "Terminales", "home.stat.buyers": "Compradores", "home.stat.exporters": "Exportadores",
  "home.board": "Panel de terminales", "home.allTerminals": "Todas las terminales",
  "home.wholesalers": "{n} mayoristas", "home.wholesaler": "{n} mayorista",
  "home.latestRequests": "Últimas solicitudes de compra", "home.latestOffers": "Últimas ofertas",
  "home.noRequests": "Aún no hay solicitudes abiertas. Los compradores publican lo que necesitan y se avisa a los exportadores que coinciden.",
  "home.noOffers": "Aún no hay ofertas abiertas. Los exportadores publican su disponibilidad por producto y temporada.",
  "home.browseTitle": "Explorar por terminal",
  "home.browseBody": "Cada terminal listada tiene una página con su ubicación, horario y los mayoristas que operan dentro.",
  "home.claimTitle": "Reclama tu ficha",
  "home.claimBody": "¿Listada desde fuentes públicas y marcada como No reclamada? Recláma­la gratis, corrige los datos y empieza a recibir consultas.",
  "home.membersTitle": "Los miembros ven los contactos",
  "home.membersBody": "Navegar es gratis con una consulta al día. Seller Pro y Buyer Pro desbloquean teléfono, correo y web en cada perfil.",
  "home.seePlans": "Ver planes",
  "lang.label": "Idioma",
};
const DICTS: Record<Locale, Dict> = { en, ar, es };

export function translator(locale: Locale) {
  const d = DICTS[locale] ?? en;
  return (key: string, vars?: Record<string, string | number>) => {
    let s = d[key] ?? en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
    return s;
  };
}
