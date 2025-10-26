"""Voting system serializers"""

from rest_framework import serializers
from dpms.compos.models import (
    VotingConfiguration,
    AttendanceCode,
    AttendeeVerification,
    JuryMember,
    Vote,
    VotingPeriod,
)
from dpms.users.serializers import ResumedUserModelSerializer
from dpms.compos.serializers.compos import CompoSerializer
from dpms.compos.serializers.editions import EditionListSerializer
from dpms.compos.serializers.productions import ProductionSerializer


class VotingConfigurationSerializer(serializers.ModelSerializer):
    """Serializer for VotingConfiguration"""

    edition_detail = EditionListSerializer(source="edition", read_only=True)

    class Meta:
        model = VotingConfiguration
        fields = [
            "id",
            "edition",
            "edition_detail",
            "voting_mode",
            "public_weight",
            "jury_weight",
            "access_mode",
            "results_published",
            "results_published_at",
            "show_partial_results",
            "created",
            "modified",
        ]
        read_only_fields = ["id", "created", "modified", "results_published_at"]

    def validate(self, data):
        """Validate that weights sum 100% in mixed mode"""
        voting_mode = data.get("voting_mode")
        public_weight = data.get("public_weight", 100)
        jury_weight = data.get("jury_weight", 0)

        if voting_mode == "mixed":
            if public_weight + jury_weight != 100:
                raise serializers.ValidationError(
                    "Public and jury weights must sum 100% in mixed mode"
                )

        return data


class AttendanceCodeSerializer(serializers.ModelSerializer):
    """Serializer for AttendanceCode"""

    edition_title = serializers.CharField(source="edition.title", read_only=True)
    used_by_detail = ResumedUserModelSerializer(source="used_by", read_only=True)

    class Meta:
        model = AttendanceCode
        fields = [
            "id",
            "code",
            "edition",
            "edition_title",
            "is_used",
            "used_by",
            "used_by_detail",
            "used_at",
            "notes",
            "created",
            "modified",
        ]
        read_only_fields = [
            "id",
            "is_used",
            "used_by",
            "used_at",
            "created",
            "modified",
        ]


class AttendanceCodeGenerateSerializer(serializers.Serializer):
    """Serializer for generating attendance codes"""

    edition_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, max_value=1000)
    prefix = serializers.CharField(max_length=10, required=False, allow_blank=True)

    def validate_quantity(self, value):
        """Validate quantity"""
        if value > 1000:
            raise serializers.ValidationError(
                "Cannot generate more than 1000 codes at once"
            )
        return value


class AttendanceCodeUseSerializer(serializers.Serializer):
    """Serializer for using an attendance code"""

    code = serializers.CharField(max_length=50)

    def validate_code(self, value):
        """Validate that code exists and is not used"""
        try:
            code = AttendanceCode.objects.get(code=value)
        except AttendanceCode.DoesNotExist:
            raise serializers.ValidationError("Invalid code")

        if code.is_used:
            raise serializers.ValidationError("Code already used")

        return value


class AttendeeVerificationSerializer(serializers.ModelSerializer):
    """Serializer for AttendeeVerification"""

    user_detail = ResumedUserModelSerializer(source="user", read_only=True)
    edition_title = serializers.CharField(source="edition.title", read_only=True)
    verified_by_detail = ResumedUserModelSerializer(
        source="verified_by", read_only=True
    )

    class Meta:
        model = AttendeeVerification
        fields = [
            "id",
            "user",
            "user_detail",
            "edition",
            "edition_title",
            "is_verified",
            "verified_by",
            "verified_by_detail",
            "verified_at",
            "verification_method",
            "notes",
            "created",
            "modified",
        ]
        read_only_fields = ["id", "verified_at", "created", "modified"]


class AttendeeVerificationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating attendee verification"""

    class Meta:
        model = AttendeeVerification
        fields = [
            "user",
            "edition",
            "is_verified",
            "verification_method",
            "notes",
        ]

    def create(self, validated_data):
        """Set verified_by and verified_at if verifying"""
        from django.utils import timezone

        if validated_data.get("is_verified"):
            validated_data["verified_by"] = self.context["request"].user
            validated_data["verified_at"] = timezone.now()

        return super().create(validated_data)


class JuryMemberSerializer(serializers.ModelSerializer):
    """Serializer for JuryMember"""

    user_detail = ResumedUserModelSerializer(source="user", read_only=True)
    edition_title = serializers.CharField(source="edition.title", read_only=True)
    compos_detail = CompoSerializer(source="compos", many=True, read_only=True)
    voting_progress = serializers.SerializerMethodField()

    class Meta:
        model = JuryMember
        fields = [
            "id",
            "user",
            "user_detail",
            "edition",
            "edition_title",
            "compos",
            "compos_detail",
            "notes",
            "voting_progress",
            "created",
            "modified",
        ]
        read_only_fields = ["id", "created", "modified"]

    def get_voting_progress(self, obj):
        """Get voting progress for this jury member"""
        return obj.get_voting_progress()


class JuryMemberCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating jury members"""

    class Meta:
        model = JuryMember
        fields = [
            "user",
            "edition",
            "compos",
            "notes",
        ]


class VoteSerializer(serializers.ModelSerializer):
    """Serializer for Vote"""

    user_detail = ResumedUserModelSerializer(source="user", read_only=True)
    production_detail = ProductionSerializer(source="production", read_only=True)

    class Meta:
        model = Vote
        fields = [
            "id",
            "user",
            "user_detail",
            "production",
            "production_detail",
            "score",
            "comment",
            "is_jury_vote",
            "created",
            "modified",
        ]
        read_only_fields = ["id", "is_jury_vote", "created", "modified"]

    def create(self, validated_data):
        """Set user to current user"""
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)

    def validate(self, data):
        """Run model clean validation"""
        instance = Vote(**data)
        if not instance.pk:
            # Set user for validation
            instance.user = self.context["request"].user
        instance.clean()
        return data


class VoteCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for creating votes"""

    class Meta:
        model = Vote
        fields = [
            "production",
            "score",
            "comment",
        ]

    def create(self, validated_data):
        """Set user to current user"""
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)

    def validate(self, data):
        """Run model clean validation"""
        instance = Vote(**data)
        instance.user = self.context["request"].user
        instance.clean()
        return data


class VotingPeriodSerializer(serializers.ModelSerializer):
    """Serializer for VotingPeriod"""

    edition_title = serializers.CharField(source="edition.title", read_only=True)
    compo_name = serializers.CharField(source="compo.name", read_only=True)
    is_open = serializers.SerializerMethodField()

    class Meta:
        model = VotingPeriod
        fields = [
            "id",
            "edition",
            "edition_title",
            "compo",
            "compo_name",
            "start_date",
            "end_date",
            "is_active",
            "is_open",
            "created",
            "modified",
        ]
        read_only_fields = ["id", "created", "modified"]

    def get_is_open(self, obj):
        """Check if voting period is currently open"""
        return obj.is_open()

    def validate(self, data):
        """Validate dates"""
        start_date = data.get("start_date")
        end_date = data.get("end_date")

        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError(
                "End date must be after start date"
            )

        return data


class VotingResultsSerializer(serializers.Serializer):
    """Serializer for voting results"""

    production_id = serializers.IntegerField()
    production_title = serializers.CharField()
    production_authors = serializers.CharField()
    compo_name = serializers.CharField()
    total_votes = serializers.IntegerField()
    public_votes = serializers.IntegerField()
    jury_votes = serializers.IntegerField()
    public_avg_score = serializers.FloatField()
    jury_avg_score = serializers.FloatField()
    final_score = serializers.FloatField()
    ranking = serializers.IntegerField()


class VotingStatsSerializer(serializers.Serializer):
    """Serializer for voting statistics"""

    total_votes = serializers.IntegerField()
    public_votes = serializers.IntegerField()
    jury_votes = serializers.IntegerField()
    total_voters = serializers.IntegerField()
    eligible_voters = serializers.IntegerField()
    participation_rate = serializers.FloatField()
    votes_by_compo = serializers.DictField()
    votes_by_score = serializers.DictField()
