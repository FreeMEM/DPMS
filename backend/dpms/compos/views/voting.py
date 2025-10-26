"""Voting system ViewSets"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q, Avg, Count
from django.utils import timezone
from django.shortcuts import get_object_or_404

from dpms.compos.models import (
    VotingConfiguration,
    AttendanceCode,
    AttendeeVerification,
    JuryMember,
    Vote,
    VotingPeriod,
    Edition,
    Production,
)
from dpms.compos.serializers import (
    VotingConfigurationSerializer,
    AttendanceCodeSerializer,
    AttendanceCodeGenerateSerializer,
    AttendanceCodeUseSerializer,
    AttendeeVerificationSerializer,
    AttendeeVerificationCreateSerializer,
    JuryMemberSerializer,
    JuryMemberCreateSerializer,
    VoteSerializer,
    VoteCreateSerializer,
    VotingPeriodSerializer,
    VotingResultsSerializer,
    VotingStatsSerializer,
)
from dpms.compos.permissions import IsAdminOrReadOnly, IsOwnerOrAdmin


class VotingConfigurationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing VotingConfiguration.

    list: List all voting configurations (admin only)
    retrieve: Get voting configuration for an edition
    create: Create voting configuration (admin only)
    update: Update voting configuration (admin only)
    destroy: Delete voting configuration (admin only)
    publish_results: Publish results for an edition
    """

    queryset = VotingConfiguration.objects.all().select_related("edition")
    serializer_class = VotingConfigurationSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        """Filter by edition if specified"""
        queryset = super().get_queryset()
        edition_id = self.request.query_params.get("edition")

        if edition_id:
            queryset = queryset.filter(edition_id=edition_id)

        return queryset

    @action(detail=True, methods=["post"])
    def publish_results(self, request, pk=None):
        """
        Publish voting results for an edition.

        POST /api/voting-config/{id}/publish_results/
        """
        config = self.get_object()

        # Check if user is admin
        if not request.user.groups.filter(name="DPMS Admins").exists():
            return Response(
                {"error": "Only admins can publish results"},
                status=status.HTTP_403_FORBIDDEN,
            )

        config.results_published = True
        config.results_published_at = timezone.now()
        config.save()

        return Response(
            {
                "message": "Results published successfully",
                "published_at": config.results_published_at,
            }
        )


class AttendanceCodeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing AttendanceCodes.

    list: List all attendance codes (admin only)
    retrieve: Get attendance code details (admin only)
    create: Create attendance code (admin only)
    destroy: Delete attendance code (admin only)
    generate: Generate batch of attendance codes (admin only)
    use: Use an attendance code (authenticated users)
    export: Export attendance codes for printing (admin only)
    """

    queryset = AttendanceCode.objects.all().select_related("edition", "used_by")
    serializer_class = AttendanceCodeSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        """Filter by edition if specified"""
        queryset = super().get_queryset()
        edition_id = self.request.query_params.get("edition")
        is_used = self.request.query_params.get("is_used")

        if edition_id:
            queryset = queryset.filter(edition_id=edition_id)

        if is_used is not None:
            queryset = queryset.filter(is_used=is_used.lower() == "true")

        return queryset.order_by("code")

    @action(detail=False, methods=["post"])
    def generate(self, request):
        """
        Generate a batch of attendance codes.

        POST /api/attendance-codes/generate/
        Body: {
            "edition_id": 1,
            "quantity": 100,
            "prefix": "PP25"  # optional
        }
        """
        # Check if user is admin
        if not request.user.groups.filter(name="DPMS Admins").exists():
            return Response(
                {"error": "Only admins can generate codes"},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = AttendanceCodeGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        edition_id = serializer.validated_data["edition_id"]
        quantity = serializer.validated_data["quantity"]
        prefix = serializer.validated_data.get("prefix")

        try:
            edition = Edition.objects.get(pk=edition_id)
        except Edition.DoesNotExist:
            return Response(
                {"error": "Edition not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Generate codes
        codes = AttendanceCode.generate_codes(edition, quantity, prefix)

        return Response(
            {
                "message": f"Generated {len(codes)} codes",
                "quantity": len(codes),
                "edition": edition.title,
                "codes": [code.code for code in codes[:10]],  # First 10 codes
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], permission_classes=[IsAuthenticated])
    def use(self, request):
        """
        Use an attendance code to verify attendance.

        POST /api/attendance-codes/use/
        Body: {
            "code": "PP25-ABCD-1234"
        }
        """
        serializer = AttendanceCodeUseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code_string = serializer.validated_data["code"]

        try:
            code = AttendanceCode.objects.get(code=code_string)
        except AttendanceCode.DoesNotExist:
            return Response(
                {"error": "Invalid code"}, status=status.HTTP_404_NOT_FOUND
            )

        # Check if code is already used
        if code.is_used:
            return Response(
                {"error": "Code already used"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Use the code
        try:
            code.use_code(request.user)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "message": "Code used successfully. You are now verified as an attendee.",
                "edition": code.edition.title,
            }
        )

    @action(detail=False, methods=["get"])
    def export(self, request):
        """
        Export attendance codes for an edition.

        GET /api/attendance-codes/export/?edition={id}
        """
        # Check if user is admin
        if not request.user.groups.filter(name="DPMS Admins").exists():
            return Response(
                {"error": "Only admins can export codes"},
                status=status.HTTP_403_FORBIDDEN,
            )

        edition_id = request.query_params.get("edition")
        if not edition_id:
            return Response(
                {"error": "Edition ID required"}, status=status.HTTP_400_BAD_REQUEST
            )

        codes = AttendanceCode.objects.filter(edition_id=edition_id).order_by("code")

        # Return as CSV data
        import csv
        from django.http import HttpResponse

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="codes_edition_{edition_id}.csv"'

        writer = csv.writer(response)
        writer.writerow(["Code", "Used", "Used By", "Used At"])

        for code in codes:
            writer.writerow([
                code.code,
                "Yes" if code.is_used else "No",
                code.used_by.email if code.used_by else "",
                code.used_at.strftime("%Y-%m-%d %H:%M") if code.used_at else "",
            ])

        return response


class AttendeeVerificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing AttendeeVerifications.

    list: List attendee verifications (admin only)
    retrieve: Get attendee verification details (admin only)
    create: Create/verify attendee (admin only)
    update: Update verification (admin only)
    destroy: Delete verification (admin only)
    stats: Get verification statistics (admin only)
    """

    queryset = AttendeeVerification.objects.all().select_related(
        "user", "edition", "verified_by"
    )
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action == "create":
            return AttendeeVerificationCreateSerializer
        return AttendeeVerificationSerializer

    def get_queryset(self):
        """Filter by edition and verification status"""
        queryset = super().get_queryset()
        edition_id = self.request.query_params.get("edition")
        is_verified = self.request.query_params.get("is_verified")

        if edition_id:
            queryset = queryset.filter(edition_id=edition_id)

        if is_verified is not None:
            queryset = queryset.filter(is_verified=is_verified.lower() == "true")

        return queryset.order_by("-created")

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """
        Get verification statistics for an edition.

        GET /api/attendee-verification/stats/?edition={id}
        """
        # Check if user is admin
        if not request.user.groups.filter(name="DPMS Admins").exists():
            return Response(
                {"error": "Only admins can view stats"},
                status=status.HTTP_403_FORBIDDEN,
            )

        edition_id = request.query_params.get("edition")
        if not edition_id:
            return Response(
                {"error": "Edition ID required"}, status=status.HTTP_400_BAD_REQUEST
            )

        verifications = AttendeeVerification.objects.filter(edition_id=edition_id)

        stats = {
            "total_verifications": verifications.count(),
            "verified": verifications.filter(is_verified=True).count(),
            "pending": verifications.filter(is_verified=False).count(),
            "by_method": {
                "manual": verifications.filter(verification_method="manual").count(),
                "code": verifications.filter(verification_method="code").count(),
                "checkin": verifications.filter(verification_method="checkin").count(),
            },
        }

        return Response(stats)


class JuryMemberViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing JuryMembers.

    list: List jury members
    retrieve: Get jury member details with voting progress
    create: Add user to jury (admin only)
    update: Update jury member (admin only)
    destroy: Remove from jury (admin only)
    voting_progress: Get detailed voting progress
    """

    queryset = JuryMember.objects.all().select_related("user", "edition").prefetch_related("compos")
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action == "create":
            return JuryMemberCreateSerializer
        return JuryMemberSerializer

    def get_queryset(self):
        """Filter by edition and user"""
        queryset = super().get_queryset()
        edition_id = self.request.query_params.get("edition")
        user_id = self.request.query_params.get("user")

        if edition_id:
            queryset = queryset.filter(edition_id=edition_id)

        if user_id:
            queryset = queryset.filter(user_id=user_id)

        # Non-admin users can only see their own jury memberships
        if not self.request.user.groups.filter(name="DPMS Admins").exists():
            queryset = queryset.filter(user=self.request.user)

        return queryset.order_by("-created")

    @action(detail=True, methods=["get"])
    def voting_progress(self, request, pk=None):
        """
        Get detailed voting progress for a jury member.

        GET /api/jury-members/{id}/voting_progress/
        """
        jury_member = self.get_object()
        progress = jury_member.get_voting_progress()

        return Response(progress)


class VoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Votes.

    list: List votes (admin can see all, users can see their own)
    retrieve: Get vote details
    create: Create vote
    update: Update vote (within voting period)
    destroy: Delete vote (admin only)
    my_votes: Get current user's votes
    production_votes: Get votes for a production
    """

    queryset = Vote.objects.all().select_related("user", "production", "production__edition", "production__compo")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action == "create":
            return VoteCreateSerializer
        return VoteSerializer

    def get_queryset(self):
        """Filter votes based on user permissions"""
        queryset = super().get_queryset()

        # Non-admin users can only see their own votes
        if not self.request.user.groups.filter(name="DPMS Admins").exists():
            queryset = queryset.filter(user=self.request.user)

        # Filter by query params
        edition_id = self.request.query_params.get("edition")
        compo_id = self.request.query_params.get("compo")
        production_id = self.request.query_params.get("production")
        is_jury = self.request.query_params.get("is_jury_vote")

        if edition_id:
            queryset = queryset.filter(production__edition_id=edition_id)

        if compo_id:
            queryset = queryset.filter(production__compo_id=compo_id)

        if production_id:
            queryset = queryset.filter(production_id=production_id)

        if is_jury is not None:
            queryset = queryset.filter(is_jury_vote=is_jury.lower() == "true")

        return queryset.order_by("-created")

    @action(detail=False, methods=["get"])
    def my_votes(self, request):
        """
        Get current user's votes.

        GET /api/votes/my_votes/
        """
        votes = Vote.objects.filter(user=request.user).select_related(
            "production", "production__edition", "production__compo"
        )

        # Filter by edition if specified
        edition_id = request.query_params.get("edition")
        if edition_id:
            votes = votes.filter(production__edition_id=edition_id)

        serializer = self.get_serializer(votes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def production_votes(self, request):
        """
        Get votes for a specific production.

        GET /api/votes/production_votes/?production={id}
        """
        production_id = request.query_params.get("production")
        if not production_id:
            return Response(
                {"error": "Production ID required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if results are published or user is admin
        production = get_object_or_404(Production, pk=production_id)
        config = getattr(production.edition, "voting_config", None)

        is_admin = request.user.groups.filter(name="DPMS Admins").exists()

        if not is_admin and (not config or not config.results_published):
            return Response(
                {"error": "Results not yet published"},
                status=status.HTTP_403_FORBIDDEN,
            )

        votes = Vote.objects.filter(production_id=production_id)

        # Calculate statistics
        stats = {
            "total_votes": votes.count(),
            "public_votes": votes.filter(is_jury_vote=False).count(),
            "jury_votes": votes.filter(is_jury_vote=True).count(),
            "average_score": votes.aggregate(Avg("score"))["score__avg"] or 0,
            "public_avg": votes.filter(is_jury_vote=False).aggregate(Avg("score"))[
                "score__avg"
            ]
            or 0,
            "jury_avg": votes.filter(is_jury_vote=True).aggregate(Avg("score"))[
                "score__avg"
            ]
            or 0,
        }

        # Add final score if config exists
        if config:
            stats["final_score"] = config.calculate_final_score(production)

        return Response(stats)


class VotingPeriodViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing VotingPeriods.

    list: List voting periods
    retrieve: Get voting period details
    create: Create voting period (admin only)
    update: Update voting period (admin only)
    destroy: Delete voting period (admin only)
    current: Get currently active voting periods
    """

    queryset = VotingPeriod.objects.all().select_related("edition", "compo")
    serializer_class = VotingPeriodSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        """Filter by edition and active status"""
        queryset = super().get_queryset()
        edition_id = self.request.query_params.get("edition")
        is_active = self.request.query_params.get("is_active")
        is_open = self.request.query_params.get("is_open")

        if edition_id:
            queryset = queryset.filter(edition_id=edition_id)

        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")

        if is_open is not None and is_open.lower() == "true":
            now = timezone.now()
            queryset = queryset.filter(
                is_active=True, start_date__lte=now, end_date__gte=now
            )

        return queryset.order_by("-start_date")

    @action(detail=False, methods=["get"])
    def current(self, request):
        """
        Get currently open voting periods.

        GET /api/voting-periods/current/
        """
        now = timezone.now()
        periods = VotingPeriod.objects.filter(
            is_active=True, start_date__lte=now, end_date__gte=now
        ).select_related("edition", "compo")

        serializer = self.get_serializer(periods, many=True)
        return Response(serializer.data)


class VotingResultsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing voting results.

    This is a read-only viewset for published results.
    """

    permission_classes = [AllowAny]

    @action(detail=False, methods=["get"])
    def edition_results(self, request):
        """
        Get voting results for an edition.

        GET /api/voting-results/edition_results/?edition={id}
        """
        edition_id = request.query_params.get("edition")
        if not edition_id:
            return Response(
                {"error": "Edition ID required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            edition = Edition.objects.get(pk=edition_id)
            config = edition.voting_config
        except Edition.DoesNotExist:
            return Response(
                {"error": "Edition not found"}, status=status.HTTP_404_NOT_FOUND
            )
        except VotingConfiguration.DoesNotExist:
            return Response(
                {"error": "Voting not configured for this edition"},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check if results are published (unless admin)
        is_admin = request.user.is_authenticated and request.user.groups.filter(
            name="DPMS Admins"
        ).exists()

        if not is_admin and not config.results_published:
            return Response(
                {"error": "Results not yet published"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Get all productions with their votes
        productions = Production.objects.filter(edition=edition).prefetch_related(
            "votes"
        )

        results = []
        for production in productions:
            public_votes = production.votes.filter(is_jury_vote=False)
            jury_votes = production.votes.filter(is_jury_vote=True)

            public_avg = public_votes.aggregate(Avg("score"))["score__avg"] or 0
            jury_avg = jury_votes.aggregate(Avg("score"))["score__avg"] or 0
            final_score = config.calculate_final_score(production)

            results.append({
                "production_id": production.id,
                "production_title": production.title,
                "production_authors": production.authors,
                "compo_name": production.compo.name,
                "total_votes": production.votes.count(),
                "public_votes": public_votes.count(),
                "jury_votes": jury_votes.count(),
                "public_avg_score": round(public_avg, 2),
                "jury_avg_score": round(jury_avg, 2),
                "final_score": round(final_score, 2),
            })

        # Sort by final score and add ranking
        results.sort(key=lambda x: x["final_score"], reverse=True)
        for i, result in enumerate(results, 1):
            result["ranking"] = i

        # Group by compo
        results_by_compo = {}
        for result in results:
            compo = result["compo_name"]
            if compo not in results_by_compo:
                results_by_compo[compo] = []
            results_by_compo[compo].append(result)

        # Recalculate ranking per compo
        for compo, compo_results in results_by_compo.items():
            for i, result in enumerate(compo_results, 1):
                result["ranking"] = i

        return Response({
            "edition": edition.title,
            "voting_mode": config.voting_mode,
            "results_published_at": config.results_published_at,
            "results_by_compo": results_by_compo,
            "all_results": results,
        })

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """
        Get voting statistics for an edition.

        GET /api/voting-results/stats/?edition={id}
        """
        edition_id = request.query_params.get("edition")
        if not edition_id:
            return Response(
                {"error": "Edition ID required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            edition = Edition.objects.get(pk=edition_id)
        except Edition.DoesNotExist:
            return Response(
                {"error": "Edition not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Get votes for this edition
        votes = Vote.objects.filter(production__edition=edition)

        # Calculate stats
        stats = {
            "total_votes": votes.count(),
            "public_votes": votes.filter(is_jury_vote=False).count(),
            "jury_votes": votes.filter(is_jury_vote=True).count(),
            "total_voters": votes.values("user").distinct().count(),
            "votes_by_compo": {},
            "votes_by_score": {},
        }

        # Votes by compo
        compo_votes = (
            votes.values("production__compo__name")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        for item in compo_votes:
            stats["votes_by_compo"][item["production__compo__name"]] = item["count"]

        # Votes by score
        score_distribution = (
            votes.values("score").annotate(count=Count("id")).order_by("score")
        )

        for item in score_distribution:
            stats["votes_by_score"][str(item["score"])] = item["count"]

        # Participation rate (if we have verified attendees)
        verified = AttendeeVerification.objects.filter(
            edition=edition, is_verified=True
        ).count()

        if verified > 0:
            stats["eligible_voters"] = verified
            stats["participation_rate"] = round(
                (stats["total_voters"] / verified) * 100, 2
            )
        else:
            stats["eligible_voters"] = 0
            stats["participation_rate"] = 0

        return Response(stats)
