"""Dev/run launcher for the FastAPI backend.

Windows ProactorEventLoop closes connections with ConnectionResetError,
which surfaces in the browser as flaky "failed to fetch" errors.
This launcher forces the stable SelectorEventLoop on Windows.
"""

import asyncio
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

import uvicorn  # noqa: E402

from app.core.config import get_settings  # noqa: E402


if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        workers=1,
    )