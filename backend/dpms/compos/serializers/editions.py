"""Edition serializers"""

from rest_framework import serializers
from dpms.compos.models import Edition, HasCompo
from dpms.users.serializers import ResumedUserModelSerializer


class EditionListSerializer(serializers.ModelSerializer):
    """Serializer for listing editions (minimal data)"""

    uploaded_by = ResumedUserModelSerializer(read_only=True)
    compos_count = serializers.SerializerMethodField()
    productions_count = serializers.SerializerMethodField()

    class Meta:
        model = Edition
        fields = [
            'id',
            'title',
            'description',
            'uploaded_by',
            'public',
            'open_to_upload',
            'open_to_update',
            'compos_count',
            'productions_count',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified', 'uploaded_by']

    def get_compos_count(self, obj):
        """Return count of associated compos"""
        return obj.compos.count()

    def get_productions_count(self, obj):
        """Return count of productions in this edition"""
        return obj.productions.count()


class EditionSerializer(serializers.ModelSerializer):
    """Standard serializer for Edition CRUD operations"""

    uploaded_by = ResumedUserModelSerializer(read_only=True)

    class Meta:
        model = Edition
        fields = [
            'id',
            'title',
            'description',
            'uploaded_by',
            'public',
            'open_to_upload',
            'open_to_update',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified', 'uploaded_by']

    def create(self, validated_data):
        """Set uploaded_by to current user"""
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class HasCompoInlineSerializer(serializers.ModelSerializer):
    """Inline serializer for HasCompo (through model)"""

    compo_id = serializers.IntegerField(source='compo.id', read_only=True)
    compo_name = serializers.CharField(source='compo.name', read_only=True)
    compo_description = serializers.CharField(source='compo.description', read_only=True)

    class Meta:
        model = HasCompo
        fields = [
            'id',
            'compo_id',
            'compo_name',
            'compo_description',
            'start',
            'show_authors_on_slide',
            'open_to_upload',
            'open_to_update',
            'created',
        ]
        read_only_fields = ['id', 'created']


class EditionDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Edition with nested compos"""

    uploaded_by = ResumedUserModelSerializer(read_only=True)
    hascompo_set = HasCompoInlineSerializer(many=True, read_only=True)
    compos_count = serializers.SerializerMethodField()
    productions_count = serializers.SerializerMethodField()

    class Meta:
        model = Edition
        fields = [
            'id',
            'title',
            'description',
            'uploaded_by',
            'public',
            'open_to_upload',
            'open_to_update',
            'hascompo_set',
            'compos_count',
            'productions_count',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified', 'uploaded_by']

    def get_compos_count(self, obj):
        """Return count of associated compos"""
        return obj.compos.count()

    def get_productions_count(self, obj):
        """Return count of productions in this edition"""
        return obj.productions.count()
