from django.shortcuts import render


def index(request):
    """
    Landing page principal del sitio.
    Muestra información general del evento para visitantes no autenticados.
    """
    context = {
        'site_title': 'DPMS - Demo Party Management System',
        'event_name': 'Posadas Party 2025',
    }
    return render(request, 'website/index.html', context)
