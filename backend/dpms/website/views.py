from django.shortcuts import render
from django.utils import timezone
from dpms.compos.models import Attendance, Edition, HasCompo, Sponsor, Production


def index(request):
    """
    Landing page principal del sitio.
    Muestra información de la edición actual/próxima para visitantes.
    """
    now = timezone.now()

    # Get current/upcoming edition (public only, most recent first)
    current_edition = Edition.objects.filter(
        public=True
    ).order_by('-start_date').first()

    # Get open compos for current edition
    open_compos = []
    open_compos_count = 0
    countdown_target = None

    if current_edition:
        has_compos = HasCompo.objects.filter(
            edition=current_edition,
            open_to_upload=True
        ).select_related('compo').order_by('start')
        open_compos = [hc.compo for hc in has_compos]
        open_compos_count = len(open_compos)

        # Pick the closest upcoming date as countdown target:
        # earliest future compo deadline, otherwise the edition start date.
        future_compo = HasCompo.objects.filter(
            edition=current_edition, start__gt=now
        ).order_by('start').first()
        if future_compo:
            countdown_target = future_compo.start
        elif current_edition.start_date and current_edition.start_date > now:
            countdown_target = current_edition.start_date

    # Calculate countdown data
    countdown_data = None
    if countdown_target:
        delta = countdown_target - now
        if delta.total_seconds() > 0:
            days = delta.days
            hours, remainder = divmod(delta.seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            countdown_data = {
                'days': days,
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds,
                'target_date': countdown_target.isoformat(),
            }

    # Build compact date range label (e.g. "26–28 JUN 2026")
    event_date_range = None
    if current_edition and current_edition.start_date:
        months_es = [
            'ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN',
            'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC',
        ]
        start = current_edition.start_date
        end = current_edition.end_date
        if end and end.date() != start.date():
            if start.year == end.year and start.month == end.month:
                event_date_range = (
                    f"{start.day}–{end.day} {months_es[start.month - 1]} {start.year}"
                )
            elif start.year == end.year:
                event_date_range = (
                    f"{start.day} {months_es[start.month - 1]} – "
                    f"{end.day} {months_es[end.month - 1]} {start.year}"
                )
            else:
                event_date_range = (
                    f"{start.day} {months_es[start.month - 1]} {start.year} – "
                    f"{end.day} {months_es[end.month - 1]} {end.year}"
                )
        else:
            event_date_range = (
                f"{start.day} {months_es[start.month - 1]} {start.year}"
            )

    # Get sponsors for current edition
    sponsors = []
    if current_edition:
        sponsors = Sponsor.objects.filter(
            editions=current_edition
        ).order_by('display_order', 'name')

    # Public attendance counter (only when the edition opts in).
    attendance_count = None
    if current_edition and current_edition.attendance_count_public:
        attendance_count = Attendance.objects.filter(
            edition=current_edition
        ).count()

    # Get production screenshots for feature card slideshows
    screenshots = list(
        Production.objects.exclude(screenshot='').exclude(screenshot__isnull=True)
        .order_by('?')
        .values_list('screenshot', flat=True)[:30]
    )

    # Historical stats for retrospective slide
    all_public_editions = Edition.objects.filter(public=True).order_by('start_date')
    editions_count = all_public_editions.count()
    first_edition_year = None
    past_posters = []
    if all_public_editions.exists():
        first = all_public_editions.first()
        if first.start_date:
            first_edition_year = first.start_date.year
        past_posters = list(
            all_public_editions.exclude(poster='').exclude(poster__isnull=True)
            .exclude(pk=current_edition.pk if current_edition else None)
            .values_list('poster', flat=True)[:6]
        )
    productions_count = Production.objects.count()
    years_of_history = None
    if first_edition_year:
        years_of_history = max(1, now.year - first_edition_year)
    stats = {
        'editions': editions_count,
        'productions': productions_count,
        'first_year': first_edition_year,
        'current_year': now.year,
        'years_of_history': years_of_history,
    }

    context = {
        'site_title': 'DPMS - Demo Party Management System',
        'current_edition': current_edition,
        'open_compos': open_compos,
        'open_compos_count': open_compos_count,
        'countdown_data': countdown_data,
        'event_date_range': event_date_range,
        'sponsors': sponsors,
        'screenshots': screenshots,
        'stats': stats,
        'past_posters': past_posters,
        'attendance_count': attendance_count,
        'is_authenticated': request.user.is_authenticated,
    }
    return render(request, 'website/index.html', context)


def editions_list(request):
    """
    List of past editions - requires authentication.
    """
    if not request.user.is_authenticated:
        from django.shortcuts import redirect
        return redirect('website:index')

    editions = Edition.objects.filter(public=True).order_by('-created')

    # Get current edition for navbar
    current_edition = editions.first() if editions.exists() else None

    context = {
        'site_title': 'Ediciones - DPMS',
        'editions': editions,
        'current_edition': current_edition,
    }
    return render(request, 'website/editions.html', context)
