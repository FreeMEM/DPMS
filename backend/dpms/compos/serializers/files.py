"""File serializers"""

from rest_framework import serializers
from dpms.compos.models import File
from dpms.users.serializers import ResumedUserModelSerializer


class FileSerializer(serializers.ModelSerializer):
    """Standard serializer for File listing"""

    uploaded_by = ResumedUserModelSerializer(read_only=True)
    download_url = serializers.SerializerMethodField()
    size = serializers.SerializerMethodField()
    productions_count = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = [
            'id',
            'title',
            'description',
            'uploaded_by',
            'original_filename',
            'download_url',
            'size',
            'public',
            'is_active',
            'productions_count',
            'created',
            'modified',
        ]
        read_only_fields = [
            'id',
            'created',
            'modified',
            'uploaded_by',
            'original_filename',
            'download_url',
            'size',
        ]

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

    def get_productions_count(self, obj):
        """Return count of productions using this file"""
        return obj.productions.count()


class FileUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading files"""

    file = serializers.FileField(required=True)

    class Meta:
        model = File
        fields = [
            'id',
            'title',
            'description',
            'file',
            'public',
        ]
        read_only_fields = ['id']

    def validate_file(self, value):
        """Validate file size and type"""
        # Max file size: 100MB
        max_size = 100 * 1024 * 1024  # 100MB in bytes

        if value.size > max_size:
            raise serializers.ValidationError(
                f"File size cannot exceed 100MB. Your file is {value.size / (1024*1024):.2f}MB."
            )

        # You can add file type validation here if needed
        # allowed_extensions = ['.zip', '.png', '.jpg', '.mp3', '.mp4']
        # ext = os.path.splitext(value.name)[1].lower()
        # if ext not in allowed_extensions:
        #     raise serializers.ValidationError(
        #         f"File type {ext} is not allowed. Allowed types: {', '.join(allowed_extensions)}"
        #     )

        return value

    def create(self, validated_data):
        """Set uploaded_by to current user and store original filename"""
        validated_data['uploaded_by'] = self.context['request'].user

        # The original_filename will be set automatically by the upload_to function
        # in the File model when the file is saved

        return super().create(validated_data)


class FileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating file metadata (not the file itself)"""

    class Meta:
        model = File
        fields = [
            'id',
            'title',
            'description',
            'public',
            'is_active',
        ]
        read_only_fields = ['id']

    def update(self, instance, validated_data):
        """Only allow updating metadata, not the file itself"""
        # Prevent changing the file after upload
        validated_data.pop('file', None)
        return super().update(instance, validated_data)
