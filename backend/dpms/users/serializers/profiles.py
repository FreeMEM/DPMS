""" Profile serializer. """

# Django REST Framework

from rest_framework import serializers

# Models
from dpms.users.models import Profile


class ProfileModelSerializer(serializers.ModelSerializer):
    """Profile model serializer"""

    class Meta:
        """
        MEta class. Attributes to use in the serializer
        """

        model = Profile
        """ fields to show """
        fields = (
            "extra_information",
            "avatar",
            "nickname",
            "group",
            "visit_listing"
        )
