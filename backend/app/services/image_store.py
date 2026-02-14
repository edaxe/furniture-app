import uuid
import time
import threading
from typing import Optional


class ImageStore:
    """Thread-safe in-memory image store with TTL for visual similarity matching."""

    def __init__(self, ttl_seconds: int = 600, max_entries: int = 100):
        self._store: dict[str, tuple[bytes, float]] = {}
        self._lock = threading.Lock()
        self._ttl = ttl_seconds
        self._max_entries = max_entries

        # Start background cleanup thread
        self._cleanup_thread = threading.Thread(target=self._cleanup_loop, daemon=True)
        self._cleanup_thread.start()

    def store(self, image_bytes: bytes) -> Optional[str]:
        """Store an image and return a session ID. Returns None if store is full."""
        with self._lock:
            # Evict expired entries first
            self._evict_expired()

            if len(self._store) >= self._max_entries:
                return None

            session_id = str(uuid.uuid4())
            self._store[session_id] = (image_bytes, time.time())
            return session_id

    def get(self, session_id: str) -> Optional[bytes]:
        """Retrieve an image by session ID. Returns None if not found or expired."""
        with self._lock:
            entry = self._store.get(session_id)
            if entry is None:
                return None
            image_bytes, stored_at = entry
            if time.time() - stored_at > self._ttl:
                del self._store[session_id]
                return None
            return image_bytes

    def _evict_expired(self):
        """Remove expired entries. Must be called with lock held."""
        now = time.time()
        expired = [k for k, (_, t) in self._store.items() if now - t > self._ttl]
        for key in expired:
            del self._store[key]

    def _cleanup_loop(self):
        """Periodically clean up expired entries."""
        while True:
            time.sleep(60)
            with self._lock:
                self._evict_expired()


# Singleton instance
image_store = ImageStore()
