"""Edition serializers"""

from rest_framework import serializers
from dpms.compos.models import Edition, HasCompo, Sponsor
from dpms.users.serializers import ResumedUserModelSerializer


EDITION_CONTACT_FIELDS = [
    'contact_info',
    'contact_info_es',
    'contact_info_en',
    'travel_info',
    'travel_info_es',
    'travel_info_en',
    'contact_form_enabled',
    'contact_email',
]


class SponsorInlineSerializer(serializers.ModelSerializer):
    """Inline serializer for sponsors in Edition detail"""

    class Meta:
        model = Sponsor
        fields = ['id', 'name', 'logo', 'url', 'display_order']
        read_only_fields = ['id']


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
            'description_es',
            'description_en',
            'logo',
            'poster',
            'logo_border_color',
            'logo_border_width',
            'uploaded_by',
            'start_date',
            'end_date',
            'public',
            'open_to_upload',
            'open_to_update',
            'productions_public',
            'auto_approve_productions',
            *EDITION_CONTACT_FIELDS,
            'compos_count',
            'productions_count',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified', 'uploaded_by']

    def get_compos_count(self, obj):
        return obj.compos.count()

    def get_productions_count(self, obj):
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
            'description_es',
            'description_en',
            'logo',
            'poster',
            'logo_border_color',
            'logo_border_width',
            'uploaded_by',
            'start_date',
            'end_date',
            'public',
            'open_to_upload',
            'open_to_update',
            'productions_public',
            'auto_approve_productions',
            *EDITION_CONTACT_FIELDS,
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
    compo_rules = serializers.CharField(source='compo.rules', read_only=True)

    class Meta:
        model = HasCompo
        fields = [
            'id',
            'compo_id',
            'compo_name',
            'compo_description',
            'compo_rules',
            'start',
            'show_authors_on_slide',
            'open_to_upload',
            'open_to_update',
            'created',
        ]
        read_only_fields = ['id', 'created']


class EditionDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Edition with nested compos and sponsors"""

    uploaded_by = ResumedUserModelSerializer(read_only=True)
    hascompo_set = HasCompoInlineSerializer(many=True, read_only=True)
    sponsors = SponsorInlineSerializer(many=True, read_only=True)
    compos_count = serializers.SerializerMethodField()
    productions_count = serializers.SerializerMethodField()

    class Meta:
        model = Edition
        fields = [
            'id',
            'title',
            'description',
            'description_es',
            'description_en',
            'logo',
            'poster',
            'logo_border_color',
            'logo_border_width',
            'uploaded_by',
            'start_date',
            'end_date',
            'public',
            'open_to_upload',
            'open_to_update',
            'productions_public',
            'auto_approve_productions',
            *EDITION_CONTACT_FIELDS,
            'hascompo_set',
            'sponsors',
            'compos_count',
            'productions_count',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified', 'uploaded_by']

    def get_compos_count(self, obj):
        return obj.compos.count()

    def get_productions_count(self, obj):
        return obj.productions.count()


class ContactFormSerializer(serializers.Serializer):
    """Serializer for the public contact form"""
    edition = serializers.IntegerField()
    name = serializers.CharField(max_length=255)
    email = serializers.EmailField()
    subject = serializers.CharField(max_length=255)
    message = serializers.CharField()
