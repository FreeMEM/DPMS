from django.shortcuts import render
from django.utils import timezone
from dpms.compos.models import Edition, HasCompo


def index(request):
    """
    Landing page principal del sitio.
    Muestra información de la edición actual/próxima para visitantes.
    """
    now = timezone.now()

    # Get current/upcoming edition (public only, most recent first)
    current_edition = Edition.objects.filter(
        public=True
    ).order_by('-created').first()

    # Get open compos for current edition
    open_compos = []
    open_compos_count = 0
    earliest_start = None

    if current_edition:
        has_compos = HasCompo.objects.filter(
            edition=current_edition,
            open_to_upload=True
        ).select_related('compo').order_by('start')
        open_compos = [hc.compo for hc in has_compos]
        open_compos_count = len(open_compos)

        # Get the earliest start date from compos for countdown
        first_compo = HasCompo.objects.filter(
            edition=current_edition
        ).order_by('start').first()
        if first_compo:
            earliest_start = first_compo.start

    # Calculate countdown data using earliest compo start
    countdown_data = None
    if earliest_start:
        delta = earliest_start - now
        if delta.total_seconds() > 0:
            days = delta.days
            hours, remainder = divmod(delta.seconds, 3600)
            minutes, seconds = divmod(remainder, 60)
            countdown_data = {
                'days': days,
                'hours': hours,
                'minutes': minutes,
                'seconds': seconds,
                'target_date': earliest_start.isoformat(),
            }

    context = {
        'site_title': 'DPMS - Demo Party Management System',
        'current_edition': current_edition,
        'open_compos': open_compos,
        'open_compos_count': open_compos_count,
        'countdown_data': countdown_data,
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

    context = {
        'site_title': 'Ediciones - DPMS',
        'editions': editions,
    }
    return render(request, 'website/editions.html', context)
