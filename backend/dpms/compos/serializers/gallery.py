"""Gallery Image serializers"""

from rest_framework import serializers
from dpms.compos.models import GalleryImage, Edition
from dpms.users.serializers import ResumedUserModelSerializer


class GalleryImageSerializer(serializers.ModelSerializer):
    """Standard serializer for Gallery Image listing"""

    uploaded_by = ResumedUserModelSerializer(read_only=True)
    uploader_name = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    edition_name = serializers.SerializerMethodField()

    class Meta:
        model = GalleryImage
        fields = [
            'id',
            'title',
            'description',
            'edition',
            'edition_name',
            'uploaded_by',
            'uploader_name',
            'original_filename',
            'image_url',
            'thumbnail_url',
            'public',
            'is_active',
            'created',
            'modified',
        ]
        read_only_fields = [
            'id',
            'created',
            'modified',
            'uploaded_by',
            'original_filename',
            'image_url',
            'thumbnail_url',
        ]

    def get_image_url(self, obj):
        """Return full URL for the image"""
        request = self.context.get('request')
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_thumbnail_url(self, obj):
        """Return full URL for the thumbnail"""
        request = self.context.get('request')
        if request and obj.thumbnail:
            return request.build_absolute_uri(obj.thumbnail.url)
        # Fallback to main image if no thumbnail
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

    def get_edition_name(self, obj):
        """Return edition name"""
        if obj.edition:
            return obj.edition.title
        return None

    def get_uploader_name(self, obj):
        """Return display name of the uploader"""
        return obj.get_uploader_display_name()


class GalleryImageUploadSerializer(serializers.ModelSerializer):
    """Serializer for uploading gallery images"""

    image = serializers.ImageField(required=True)

    class Meta:
        model = GalleryImage
        fields = [
            'id',
            'title',
            'description',
            'edition',
            'image',
            'public',
        ]
        read_only_fields = ['id']

    def validate_image(self, value):
        """Validate image file size and type"""
        # Max image size: 20MB
        max_size = 20 * 1024 * 1024

        if value.size > max_size:
            raise serializers.ValidationError(
                f"Image size cannot exceed 20MB. Your image is {value.size / (1024*1024):.2f}MB."
            )

        # Validate image type
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        ext = '.' + value.name.split('.')[-1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"Image type {ext} is not allowed. Allowed types: {', '.join(allowed_extensions)}"
            )

        return value

    def create(self, validated_data):
        """Set uploaded_by to current user"""
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class GalleryImageUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating gallery image metadata"""

    class Meta:
        model = GalleryImage
        fields = [
            'id',
            'title',
            'description',
            'edition',
            'public',
            'is_active',
        ]
        read_only_fields = ['id']

    def update(self, instance, validated_data):
        """Only allow updating metadata, not the image itself"""
        validated_data.pop('image', None)
        return super().update(instance, validated_data)


class GalleryImageDetailSerializer(GalleryImageSerializer):
    """Detailed serializer for single gallery image view"""

    class Meta(GalleryImageSerializer.Meta):
        fields = GalleryImageSerializer.Meta.fields + ['is_deleted']
