import os
import time
from scrapling.fetchers import Fetcher

_last: dict[str, float] = {}


def get(url: str):
    """Polite GET: one request per SCRAPE_DELAY seconds per host, real UA headers."""
    host = url.split("/")[2]
    delay = float(os.environ.get("SCRAPE_DELAY", "2"))
    wait = _last.get(host, 0) + delay - time.time()
    if wait > 0:
        time.sleep(wait)
    page = Fetcher.get(url, stealthy_headers=True, follow_redirects=True, timeout=30)
    _last[host] = time.time()
    return page
