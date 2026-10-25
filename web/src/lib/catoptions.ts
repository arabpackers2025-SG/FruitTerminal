import { listCategories } from "@/lib/queries";

/** Flat, indented category options for a <select>. */
export async function categoryOptions(): Promise<{ slug: string; label: string }[]> {
  const { byParent } = await listCategories();
  const out: { slug: string; label: string }[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const c of byParent.get(parentId) ?? []) {
      out.push({ slug: c.slug, label: `${"  ".repeat(depth)}${c.name}` });
      walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}
