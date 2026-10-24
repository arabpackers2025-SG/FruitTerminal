"""Usage:
  ft-scrape list                 show available terminal parsers
  ft-scrape run <slug> [--dry]   scrape one terminal into staging_companies
  ft-scrape run all [--dry]      scrape every registered terminal, one at a time
"""
import json
import sys
from dotenv import load_dotenv
from .terminals import REGISTRY
from .store import save


def main(argv=None):
    load_dotenv()
    argv = sys.argv[1:] if argv is None else argv
    if not argv or argv[0] in {"-h", "--help"}:
        print(__doc__)
        return 0
    cmd = argv[0]
    if cmd == "list":
        for slug in REGISTRY:
            print(slug)
        return 0
    if cmd == "run":
        if len(argv) < 2:
            print(__doc__)
            return 2
        dry = "--dry" in argv
        targets = list(REGISTRY) if argv[1] == "all" else [argv[1]]
        for slug in targets:
            mod = REGISTRY.get(slug)
            if not mod:
                print(f"unknown terminal: {slug}", file=sys.stderr)
                return 2
            print(f"[{slug}] scraping…", flush=True)
            records = mod.scrape()
            print(f"[{slug}] {len(records)} records", flush=True)
            if dry:
                for r in records:
                    print(json.dumps(r.as_row(), ensure_ascii=False))
            else:
                n = save(records)
                print(f"[{slug}] {n} rows upserted into staging_companies (review: PENDING)")
        return 0
    print(__doc__)
    return 2


if __name__ == "__main__":
    sys.exit(main())
