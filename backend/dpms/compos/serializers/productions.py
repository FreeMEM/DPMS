"""Production serializers"""

from rest_framework import serializers
from django.utils import timezone
from dpms.compos.models import Production, File, HasCompo
from dpms.users.serializers import ResumedUserModelSerializer


class ProductionFileSerializer(serializers.ModelSerializer):
    """Inline serializer for files in productions"""

    download_url = serializers.SerializerMethodField()
    size = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = [
            'id',
            'title',
            'description',
            'original_filename',
            'download_url',
            'size',
            'public',
            'created',
        ]
        read_only_fields = fields

    def get_download_url(self, obj):
        """Return download URL for the file"""
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None

    def get_size(self, obj):
        """Return file size in bytes"""
        if obj.file:
            return obj.file.size
        return None


class ProductionSerializer(serializers.ModelSerializer):
    """Standard serializer for Production listing"""

    uploaded_by = ResumedUserModelSerializer(read_only=True)
    edition_title = serializers.CharField(source='edition.title', read_only=True)
    compo_name = serializers.CharField(source='compo.name', read_only=True)
    files_count = serializers.SerializerMethodField()

    screenshot_url = serializers.SerializerMethodField()

    class Meta:
        model = Production
        fields = [
            'id',
            'title',
            'authors',
            'description',
            'uploaded_by',
            'edition',
            'edition_title',
            'compo',
            'compo_name',
            'platform',
            'release_date',
            'screenshot_url',
            'youtube_url',
            'demozoo_url',
            'pouet_url',
            'scene_org_url',
            'files_count',
            'status',
            'rejection_reason',
            'rejection_notes',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified', 'uploaded_by', 'status', 'rejection_reason', 'rejection_notes']

    def get_screenshot_url(self, obj):
        request = self.context.get('request')
        if request and obj.screenshot:
            return request.build_absolute_uri(obj.screenshot.url)
        return None

    def get_files_count(self, obj):
        """Return count of associated files"""
        return obj.files.count()


class ProductionDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Production with nested files"""

    uploaded_by = ResumedUserModelSerializer(read_only=True)
    reviewed_by = ResumedUserModelSerializer(read_only=True)
    edition_title = serializers.CharField(source='edition.title', read_only=True)
    compo_name = serializers.CharField(source='compo.name', read_only=True)
    files = ProductionFileSerializer(many=True, read_only=True)
    screenshot_url = serializers.SerializerMethodField()
    platform_display = serializers.CharField(source='get_platform_display', read_only=True)

    class Meta:
        model = Production
        fields = [
            'id',
            'title',
            'authors',
            'description',
            'uploaded_by',
            'edition',
            'edition_title',
            'compo',
            'compo_name',
            'platform',
            'platform_display',
            'release_date',
            'screenshot_url',
            'youtube_url',
            'demozoo_url',
            'pouet_url',
            'scene_org_url',
            'files',
            'status',
            'rejection_reason',
            'rejection_notes',
            'reviewed_by',
            'reviewed_at',
            'created',
            'modified',
        ]
        read_only_fields = ['id', 'created', 'modified', 'uploaded_by']

    def get_screenshot_url(self, obj):
        request = self.context.get('request')
        if request and obj.screenshot:
            return request.build_absolute_uri(obj.screenshot.url)
        return None


class ProductionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating productions"""

    files = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=File.objects.all(),
        required=False
    )

    class Meta:
        model = Production
        fields = [
            'id',
            'title',
            'authors',
            'description',
            'edition',
            'compo',
            'files',
            'platform',
            'release_date',
            'screenshot',
            'youtube_url',
            'demozoo_url',
            'pouet_url',
            'scene_org_url',
        ]
        read_only_fields = ['id']

    def validate(self, data):
        """Validate that uploads are allowed for this edition/compo"""
        edition = data.get('edition', getattr(self.instance, 'edition', None))
        compo = data.get('compo', getattr(self.instance, 'compo', None))

        if not edition or not compo:
            raise serializers.ValidationError(
                "Both edition and compo are required."
            )

        # Check if the edition is open to uploads
        if not edition.open_to_upload:
            raise serializers.ValidationError(
                "This edition is not currently accepting submissions."
            )

        # Check if the specific compo in this edition is open
        try:
            has_compo = HasCompo.objects.get(edition=edition, compo=compo)
            if not has_compo.open_to_upload:
                raise serializers.ValidationError(
                    f"The {compo.name} competition is not currently accepting submissions for this edition."
                )
        except HasCompo.DoesNotExist:
            raise serializers.ValidationError(
                f"The {compo.name} competition is not available in this edition."
            )

        # Validate files belong to the current user
        files = data.get('files', [])
        request = self.context.get('request')
        if request and files:
            user_files = File.objects.filter(
                id__in=[f.id for f in files],
                uploaded_by=request.user
            )
            if user_files.count() != len(files):
                raise serializers.ValidationError(
                    "You can only attach files that you have uploaded."
                )

        return data

    def create(self, validated_data):
        """Set uploaded_by to current user and auto-approve if edition allows it"""
        files = validated_data.pop('files', [])
        validated_data['uploaded_by'] = self.context['request'].user

        # Auto-approve if edition has it enabled
        edition = validated_data.get('edition')
        if edition and edition.auto_approve_productions:
            validated_data['status'] = 'approved'
        else:
            validated_data['status'] = 'pending'

        production = super().create(validated_data)

        # Associate files
        if files:
            production.files.set(files)

        return production

    def update(self, instance, validated_data):
        """Update production and handle files"""
        # Check if updates are allowed
        if not instance.edition.open_to_update:
            try:
                has_compo = HasCompo.objects.get(
                    edition=instance.edition,
                    compo=instance.compo
                )
                if not has_compo.open_to_update:
                    raise serializers.ValidationError(
                        "Updates are no longer allowed for this competition."
                    )
            except HasCompo.DoesNotExist:
                raise serializers.ValidationError(
                    "This competition is no longer available in this edition."
                )

        files = validated_data.pop('files', None)

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update files if provided
        if files is not None:
            instance.files.set(files)

        return instance
