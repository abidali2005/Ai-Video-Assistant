import os
import re


_REFERENCE_PATTERN = re.compile(r"^\$\{\{.+}\}$")


def env(name: str, default: str | None = None) -> str | None:
    value = os.getenv(name, default)
    if value is None:
        return None
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in ('"', "'"):
        value = value[1:-1].strip()
    return value or None


def require_env(name: str) -> str:
    value = env(name)
    if not value:
        raise RuntimeError(
            f"{name} is not set. Add it in Railway Variables on the web service."
        )
    if _REFERENCE_PATTERN.match(value):
        raise RuntimeError(
            f"{name} is still a Railway reference ({value}). "
            "Use Variables -> New Variable -> Add Reference and pick PostgreSQL -> DATABASE_URL. "
            "Do not wrap references in quotes."
        )
    if "${{" in value:
        raise RuntimeError(
            f"{name} looks unresolved ({value}). "
            "Check that the Postgres service name in the reference matches Railway exactly."
        )
    return value
