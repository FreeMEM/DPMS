"""Sponsor serializers"""

from rest_framework import serializers
from dpms.compos.models import Sponsor


class SponsorSerializer(serializers.ModelSerializer):
    """Standard serializer for Sponsor CRUD operations"""

    class Meta:
        model = Sponsor
        fields = [
            'id',
            'name',
            'logo',
            'url',
            'description',
            'display_order',
            'editions',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified']


class SponsorListSerializer(serializers.ModelSerializer):
    """Serializer for listing sponsors (minimal data for display)"""

    class Meta:
        model = Sponsor
        fields = [
            'id',
            'name',
            'logo',
            'url',
            'display_order',
        ]
        read_only_fields = ['id']


class SponsorDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Sponsor with edition names"""

    editions_names = serializers.SerializerMethodField()

    class Meta:
        model = Sponsor
        fields = [
            'id',
            'name',
            'logo',
            'url',
            'description',
            'display_order',
            'editions',
            'editions_names',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified']

    def get_editions_names(self, obj):
        """Return list of edition titles"""
        return [edition.title for edition in obj.editions.all()]
