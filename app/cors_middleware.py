import traceback

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


def _is_allowed_origin(origin: str, allowed_origins: list[str]) -> bool:
    if not origin:
        return False

    normalized = origin.rstrip("/")
    allowed = {item.rstrip("/") for item in allowed_origins if item}

    if normalized in allowed:
        return True

    if normalized.endswith(".vercel.app"):
        return True

    if normalized.startswith("http://localhost") or normalized.startswith("http://127.0.0.1"):
        return True

    return False


class ForceCORSMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, allowed_origins: list[str]):
        super().__init__(app)
        self.allowed_origins = allowed_origins

    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "")

        try:
            if request.method == "OPTIONS":
                response = Response(status_code=200)
            else:
                response = await call_next(request)
        except Exception:
            traceback.print_exc()
            response = JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"},
            )

        if _is_allowed_origin(origin, self.allowed_origins):
            requested_headers = request.headers.get(
                "access-control-request-headers",
                "authorization, content-type",
            )
            response.headers["Access-Control-Allow-Origin"] = origin.rstrip("/")
            response.headers["Access-Control-Allow-Methods"] = (
                "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            )
            response.headers["Access-Control-Allow-Headers"] = requested_headers
            response.headers["Access-Control-Max-Age"] = "600"
            response.headers["Vary"] = "Origin"

        return response
