from datetime import timedelta
from django.contrib.admin.views.decorators import staff_member_required
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.http import JsonResponse
from django.utils import timezone
from django.contrib.auth import get_user_model

from .models import Order, OrderItem


@staff_member_required
def dashboard_data(request):
    now = timezone.now()
    # Permitir filtrar por rango: day (1), week (7), month (30)
    range_param = (request.GET.get('range') or '').lower()
    if range_param == 'day':
        days = 1
    elif range_param == 'week':
        days = 7
    else:
        days = 30
    start_date = now - timedelta(days=days - 1)

    # Pedidos por día / hora si range=day
    if days == 1:
        from django.db.models.functions import TruncHour
        current_hour_local = timezone.localtime(now).replace(minute=0, second=0, microsecond=0)
        start_hour_local = current_hour_local - timedelta(hours=23)
        start_dt = timezone.make_aware(start_hour_local.replace(tzinfo=None)) if timezone.is_naive(start_hour_local) else start_hour_local
        end_dt = timezone.make_aware(current_hour_local.replace(tzinfo=None)) if timezone.is_naive(current_hour_local) else current_hour_local

        ob_qs = (
            Order.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt)
            .annotate(hour=TruncHour('created_at'))
            .values('hour')
            .annotate(count=Count('id'))
            .order_by('hour')
        )
        def hour_key(dt):
            return timezone.localtime(dt).replace(minute=0, second=0, microsecond=0).isoformat()
        ob_map = {hour_key(row['hour']): int(row['count']) for row in ob_qs}
        orders_by_day = []
        for i in range(24):
            ts = (start_hour_local + timedelta(hours=i)).replace(minute=0, second=0, microsecond=0)
            key = ts.isoformat()
            orders_by_day.append({'date': key, 'count': int(ob_map.get(key, 0))})
    else:
        orders_by_day_qs = (
            Order.objects.filter(created_at__date__gte=start_date.date())
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(count=Count('id'))
            .order_by('day')
        )
        orders_by_day = [{'date': o['day'].isoformat(), 'count': o['count']} for o in orders_by_day_qs]

    # Ingresos por día / hora si range=day (excluye cancelados)
    if days == 1:
        from django.db.models.functions import TruncHour
        current_hour_local = timezone.localtime(now).replace(minute=0, second=0, microsecond=0)
        start_hour_local = current_hour_local - timedelta(hours=23)
        start_dt = timezone.make_aware(start_hour_local.replace(tzinfo=None)) if timezone.is_naive(start_hour_local) else start_hour_local
        end_dt = timezone.make_aware(current_hour_local.replace(tzinfo=None)) if timezone.is_naive(current_hour_local) else current_hour_local

        rbd_qs = (
            Order.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt)
            .exclude(status='cancelled')
            .annotate(hour=TruncHour('created_at'))
            .values('hour')
            .annotate(total=Sum('total_amount'))
            .order_by('hour')
        )
        def hour_key(dt):
            return timezone.localtime(dt).replace(minute=0, second=0, microsecond=0).isoformat()
        rbd_map = {hour_key(row['hour']): float(row['total'] or 0) for row in rbd_qs}
        revenue_by_day = []
        for i in range(24):
            ts = (start_hour_local + timedelta(hours=i)).replace(minute=0, second=0, microsecond=0)
            key = ts.isoformat()
            revenue_by_day.append({'date': key, 'total': float(rbd_map.get(key, 0))})
    else:
        revenue_by_day_qs = (
            Order.objects.filter(created_at__date__gte=start_date.date())
            .exclude(status='cancelled')
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(total=Sum('total_amount'))
            .order_by('day')
        )
        revenue_by_day = [{'date': r['day'].isoformat(), 'total': float(r['total'] or 0)} for r in revenue_by_day_qs]

    # Distribución por estado
    status_dist_qs = (
        Order.objects.values('status')
        .annotate(count=Count('id'))
        .order_by()
    )
    status_distribution = {row['status']: row['count'] for row in status_dist_qs}

    # Top productos (por cantidad): últimas 24h si day, si no últimos N días
    if days == 1:
        from django.db.models.functions import TruncHour
        current_hour_local = timezone.localtime(now).replace(minute=0, second=0, microsecond=0)
        start_hour_local = current_hour_local - timedelta(hours=23)
        start_dt = timezone.make_aware(start_hour_local.replace(tzinfo=None)) if timezone.is_naive(start_hour_local) else start_hour_local
        end_dt = timezone.make_aware(current_hour_local.replace(tzinfo=None)) if timezone.is_naive(current_hour_local) else current_hour_local
        top_products_qs = (
            OrderItem.objects.filter(order__created_at__gte=start_dt, order__created_at__lte=end_dt)
            .values('product_name')
            .annotate(quantity=Sum('quantity'))
            .order_by('-quantity')[:5]
        )
    else:
        top_products_qs = (
            OrderItem.objects.filter(order__created_at__date__gte=start_date.date())
            .values('product_name')
            .annotate(quantity=Sum('quantity'))
            .order_by('-quantity')[:5]
        )
    top_products = [{'product': r['product_name'], 'quantity': int(r['quantity'] or 0)} for r in top_products_qs]

    # Usuarios registrados (usersByDay) como clientes únicos basados en órdenes
    from django.db.models import Case, When, Value, CharField
    from django.db.models.functions import Coalesce
    from django.db.models.functions import TruncHour
    customer_id_expr = Case(
        When(customer_email__isnull=False, customer_email__gt=Value(''), then='customer_email'),
        default=Coalesce('customer_phone', Value('')),
        output_field=CharField()
    )
    if days == 1:
        current_hour_local = timezone.localtime(now).replace(minute=0, second=0, microsecond=0)
        start_hour_local = current_hour_local - timedelta(hours=23)
        start_dt = timezone.make_aware(start_hour_local.replace(tzinfo=None)) if timezone.is_naive(start_hour_local) else start_hour_local
        end_dt = timezone.make_aware(current_hour_local.replace(tzinfo=None)) if timezone.is_naive(current_hour_local) else current_hour_local

        ubd_qs = (
            Order.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt)
            .annotate(hour=TruncHour('created_at'))
            .values('hour')
            .annotate(count=Count(customer_id_expr, distinct=True))
            .order_by('hour')
        )
        def hour_key(dt):
            return timezone.localtime(dt).replace(minute=0, second=0, microsecond=0).isoformat()
        ubd_map = {hour_key(row['hour']): int(row['count']) for row in ubd_qs}
        users_by_day = []
        for i in range(24):
            ts = (start_hour_local + timedelta(hours=i)).replace(minute=0, second=0, microsecond=0)
            key = ts.isoformat()
            users_by_day.append({'date': key, 'count': int(ubd_map.get(key, 0))})
    else:
        ubd_qs = (
            Order.objects.filter(created_at__date__gte=start_date.date())
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(count=Count(customer_id_expr, distinct=True))
            .order_by('day')
        )
        users_by_day = [{'date': r['day'].isoformat(), 'count': int(r['count'] or 0)} for r in ubd_qs]

    return JsonResponse({
        'ordersByDay': orders_by_day,
        'revenueByDay': revenue_by_day,
        'statusDistribution': status_distribution,
        'topProducts': top_products,
        'usersByDay': users_by_day,
        'rangeDays': days,
    })
