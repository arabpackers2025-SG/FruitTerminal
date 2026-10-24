from dataclasses import dataclass, field, asdict
from typing import Optional


@dataclass
class MemberRecord:
    """One company found in a terminal or association directory.
    Only business contact details are kept; personal mobiles or personal
    email addresses are never stored."""

    name: str
    source: str  # e.g. "terminal:toronto-ontario-food-terminal"
    source_url: str
    terminal_slug: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    stall: Optional[str] = None
    products: Optional[str] = None
    raw: dict = field(default_factory=dict)

    def as_row(self) -> dict:
        d = asdict(self)
        return d
