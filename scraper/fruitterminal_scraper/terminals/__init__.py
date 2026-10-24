"""One parser module per terminal. Each exposes:
   SLUG: str              terminal slug as seeded in the web app
   scrape() -> list[MemberRecord]
Register new parsers in REGISTRY."""
from . import toronto_oft

REGISTRY = {
    toronto_oft.SLUG: toronto_oft,
}
