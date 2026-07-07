import os
import re
from urllib.parse import quote_plus

_REFERENCE_PATTERN = re.compile(r"^\$\{\{.+}}$")


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
    # Allow secret() and service references to pass through - they're resolved by Railway
    if _REFERENCE_PATTERN.match(value):
        # Check if it's a secret() or service reference - these are OK
        if "secret(" in value or "." in value:
            return value
        # Otherwise it's an unresolved reference
        raise RuntimeError(
            f"{name} is unresolved ({value}). "
            "Use Variables -> New Variable -> Add Reference instead of typing ${{...}}."
        )
    return value


def _normalize_postgres_url(url: str) -> str:
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


def resolve_database_url() -> str:
    for key in ("DATABASE_URL", "DATABASE_PRIVATE_URL"):
        url = env(key)
        if url and not _REFERENCE_PATTERN.match(url) and "${{" not in url:
            return _normalize_postgres_url(url)

    host = env("PGHOST")
    if host:
        user = env("PGUSER") or "postgres"
        password = env("PGPASSWORD") or ""
        port = env("PGPORT") or "5432"
        database = env("PGDATABASE") or "railway"
        return (
            f"postgresql://{quote_plus(user)}:{quote_plus(password)}"
            f"@{host}:{port}/{database}"
        )

    db_keys = sorted(
        key for key in os.environ
        if any(part in key for part in ("PG", "DATABASE", "POSTGRES"))
    )
    raise RuntimeError(
        "Database connection not configured. On Railway, open the Ai-Video-Assistant "
        "service -> Variables -> New Variable -> Add Reference -> PostgreSQL -> "
        f"DATABASE_URL. DB-related env keys in container: {db_keys or 'none'}"
    )

