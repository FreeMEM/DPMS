"""Compo serializers"""

from rest_framework import serializers
from dpms.compos.models import Compo, HasCompo, Edition
from dpms.users.serializers import ResumedUserModelSerializer


class CompoSerializer(serializers.ModelSerializer):
    """Standard serializer for Compo CRUD operations"""

    created_by = ResumedUserModelSerializer(read_only=True)
    productions_count = serializers.SerializerMethodField()

    class Meta:
        model = Compo
        fields = [
            'id',
            'name',
            'description',
            'created_by',
            'productions_count',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified', 'created_by']

    def create(self, validated_data):
        """Set created_by to current user"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    def get_productions_count(self, obj):
        """Return total count of productions across all editions"""
        return obj.productions.count()


class CompoDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Compo with edition associations"""

    created_by = ResumedUserModelSerializer(read_only=True)
    editions_info = serializers.SerializerMethodField()
    productions_count = serializers.SerializerMethodField()

    class Meta:
        model = Compo
        fields = [
            'id',
            'name',
            'description',
            'created_by',
            'editions_info',
            'productions_count',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified', 'created_by']

    def get_editions_info(self, obj):
        """Return list of editions where this compo is available"""
        has_compos = HasCompo.objects.filter(compo=obj).select_related('edition')
        return [
            {
                'edition_id': hc.edition.id,
                'edition_title': hc.edition.title,
                'start': hc.start,
                'open_to_upload': hc.open_to_upload,
                'open_to_update': hc.open_to_update,
            }
            for hc in has_compos
        ]

    def get_productions_count(self, obj):
        """Return total count of productions across all editions"""
        return obj.productions.count()


class HasCompoSerializer(serializers.ModelSerializer):
    """Serializer for HasCompo (through model) - manages Edition<->Compo relationship"""

    edition_title = serializers.CharField(source='edition.title', read_only=True)
    compo_name = serializers.CharField(source='compo.name', read_only=True)
    created_by = ResumedUserModelSerializer(read_only=True)

    class Meta:
        model = HasCompo
        fields = [
            'id',
            'edition',
            'edition_title',
            'compo',
            'compo_name',
            'start',
            'show_authors_on_slide',
            'open_to_upload',
            'open_to_update',
            'created_by',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified', 'created_by']

    def create(self, validated_data):
        """Set created_by to current user"""
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    def validate(self, data):
        """Validate that the edition and compo combination is unique"""
        edition = data.get('edition')
        compo = data.get('compo')

        # Check if this is an update
        if self.instance:
            # Allow same edition/compo for update
            return data

        # Check for duplicates on create
        if HasCompo.objects.filter(edition=edition, compo=compo).exists():
            raise serializers.ValidationError(
                "This compo is already associated with this edition."
            )

        return data
