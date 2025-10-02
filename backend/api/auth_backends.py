from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import SAFE_METHODS


class SafeTokenAuthentication(TokenAuthentication):
    """
    Token auth that does NOT raise 401 on invalid/malformed tokens for safe (read-only) methods.
    This allows public GET endpoints to work even if the client sends a bad Authorization header.
    For unsafe methods, it behaves like the default TokenAuthentication.
    """
    def authenticate(self, request):
        # Only relax behavior for safe (read-only) methods
        if request.method in SAFE_METHODS:
            try:
                return super().authenticate(request)
            except AuthenticationFailed:
                # Treat as anonymous if token is invalid for safe methods
                return None
        # For non-safe methods, keep the default strict behavior
        return super().authenticate(request)
