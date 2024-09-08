# your_app/backends/sceneid_backend.py

from social_core.backends.oauth import BaseOAuth2


class SceneIDOAuth2(BaseOAuth2):
    """SceneID OAuth authentication backend"""

    name = "sceneid"
    AUTHORIZATION_URL = "https://id.scene.org/oauth/authorize"
    ACCESS_TOKEN_URL = "https://id.scene.org/oauth/token"
    USER_DATA_URL = "https://id.scene.org/oauth/userinfo"
    ACCESS_TOKEN_METHOD = "POST"
    EXTRA_DATA = ["refresh_token", "expires_in"]

    def get_user_details(self, response):
        """Return user details from SceneID account"""
        return {
            "username": response.get("preferred_username"),
            "email": response.get("email"),
            "first_name": response.get("given_name"),
            "last_name": response.get("family_name"),
        }

    def get_user_id(self, details, response):
        """Return the user ID from the response"""
        return response.get("sub")
