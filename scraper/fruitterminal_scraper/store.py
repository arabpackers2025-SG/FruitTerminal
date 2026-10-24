import json
import os
import psycopg
from .models import MemberRecord


def connect():
    url = os.environ["DATABASE_URL"]
    return psycopg.connect(url)


UPSERT = """
insert into staging_companies
  (name, website, phone, email, address, stall, products, country, city,
   terminal_slug, source, source_url, raw, review, scraped_at)
values
  (%(name)s, %(website)s, %(phone)s, %(email)s, %(address)s, %(stall)s, %(products)s,
   %(country)s, %(city)s, %(terminal_slug)s, %(source)s, %(source_url)s, %(raw)s::jsonb,
   'PENDING', now())
on conflict (source, name) do update set
  website = excluded.website,
  phone = excluded.phone,
  email = excluded.email,
  address = excluded.address,
  stall = excluded.stall,
  products = excluded.products,
  country = excluded.country,
  city = excluded.city,
  terminal_slug = excluded.terminal_slug,
  source_url = excluded.source_url,
  raw = excluded.raw,
  scraped_at = now()
"""


def save(records: list[MemberRecord]) -> int:
    if not records:
        return 0
    with connect() as conn, conn.cursor() as cur:
        for r in records:
            row = r.as_row()
            row["raw"] = json.dumps(row["raw"])
            cur.execute(UPSERT, row)
        conn.commit()
    return len(records)
