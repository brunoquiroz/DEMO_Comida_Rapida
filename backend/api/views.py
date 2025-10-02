from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.exceptions import ValidationError  # AGREGAR ESTA LÍNEA
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from products.models import Category, Product, ProductTag, Ingredient, ProductIngredient
from .models import HeroSection, AboutSection, ContactInfo, FeaturedProduct, Order, OrderItem, OrderItemExtra, Review, SiteConfig
from .serializers import (
    CategorySerializer, ProductSerializer, ProductDetailSerializer, ProductTagSerializer,
    HeroSectionSerializer, AboutSectionSerializer, ContactInfoSerializer, FeaturedProductSerializer,
    IngredientSerializer, ProductIngredientSerializer, OrderSerializer, CreateOrderSerializer, ReviewSerializer, SiteConfigSerializer
)
from decimal import Decimal

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """Obtener todos los productos de una categoría específica"""
        category = self.get_object()
        products = Product.objects.filter(category=category, is_active=True)
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search', 'featured', 'calculate_price']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductDetailSerializer
        return ProductSerializer
    
    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        
        if category and category != 'all':
            queryset = queryset.filter(category__name=category)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) |
                Q(category__name__icontains=search)
            )
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        # Extraer las etiquetas del request
        tag_names = []
        for key in request.data.keys():
            if key.startswith('tag_names[') and key.endswith(']'):
                tag_names.append(request.data[key])
        
        # Extraer ingredientes si vienen
        product_ingredients_data = request.data.get('product_ingredients')
        
        # Crear una copia mutable de los datos
        data = request.data.copy()
        
        # Remover las etiquetas de los datos principales
        for key in list(data.keys()):
            if key.startswith('tag_names['):
                del data[key]
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        
        # Crear tags
        for tag_name in tag_names:
            if tag_name.strip():
                ProductTag.objects.create(product=product, name=tag_name.strip())
        
        # Crear ingredientes si se enviaron como JSON
        if product_ingredients_data:
            # Se espera lista de objetos con ingredient_id, default_included, extra_cost, is_active
            from json import loads
            try:
                parsed = loads(product_ingredients_data) if isinstance(product_ingredients_data, str) else product_ingredients_data
                for pi in parsed:
                    ProductIngredient.objects.create(
                        product=product,
                        ingredient_id=pi.get('ingredient_id'),
                        default_included=pi.get('default_included', True),
                        extra_cost=pi.get('extra_cost', 0),
                        is_active=pi.get('is_active', True)
                    )
            except Exception:
                pass
        
        response_serializer = ProductDetailSerializer(product, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        tag_names = []
        for key in request.data.keys():
            if key.startswith('tag_names[') and key.endswith(']'):
                tag_names.append(request.data[key])
        
        product_ingredients_data = request.data.get('product_ingredients')
        
        data = request.data.copy()
        for key in list(data.keys()):
            if key.startswith('tag_names['):
                del data[key]
        
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        
        # Actualizar tags
        instance.tags.all().delete()
        for tag_name in tag_names:
            if tag_name.strip():
                ProductTag.objects.create(product=product, name=tag_name.strip())
        
        # Actualizar ingredientes si se envían
        if product_ingredients_data is not None:
            from json import loads
            try:
                instance.product_ingredients.all().delete()
                parsed = loads(product_ingredients_data) if isinstance(product_ingredients_data, str) else product_ingredients_data
                for pi in parsed:
                    ProductIngredient.objects.create(
                        product=product,
                        ingredient_id=pi.get('ingredient_id'),
                        default_included=pi.get('default_included', True),
                        extra_cost=pi.get('extra_cost', 0),
                        is_active=pi.get('is_active', True)
                    )
            except Exception:
                pass
        
        response_serializer = ProductDetailSerializer(product, context={'request': request})
        return Response(response_serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Obtener productos destacados (los más recientes)"""
        featured_products = Product.objects.filter(is_active=True).order_by('-created_at')[:6]
        serializer = self.get_serializer(featured_products, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Buscar productos por nombre o descripción"""
        search_term = request.query_params.get('q', '')
        if not search_term:
            return Response({'error': 'Término de búsqueda requerido'}, status=status.HTTP_400_BAD_REQUEST)
        
        products = Product.objects.filter(
            Q(name__icontains=search_term) | 
            Q(description__icontains=search_term),
            is_active=True
        )
        serializer = self.get_serializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def calculate_price(self, request, pk=None):
        """Calcular precio para un producto dado un conjunto de extras (IDs de ingredientes)."""
        try:
            product = self.get_object()
        except Product.DoesNotExist:
            return Response({'detail': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        extra_ids = request.data.get('extra_ids', [])
        if not isinstance(extra_ids, list):
            return Response({'detail': 'extra_ids debe ser una lista de IDs'}, status=status.HTTP_400_BAD_REQUEST)

        base = Decimal(product.price)
        extras_qs = product.product_ingredients.filter(default_included=False, is_active=True, ingredient_id__in=extra_ids)
        extras_total = sum((pi.extra_cost for pi in extras_qs), Decimal('0'))
        total = base + extras_total
        return Response({
            'base_price': base,
            'extras_total': extras_total,
            'total': total,
            'extra_ids': extra_ids,
        })

class ProductTagViewSet(viewsets.ModelViewSet):
    queryset = ProductTag.objects.all()
    serializer_class = ProductTagSerializer
    permission_classes = [IsAdminUser]

# NUEVOS VIEWSETS PARA INGREDIENTES
class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

class ProductIngredientViewSet(viewsets.ModelViewSet):
    queryset = ProductIngredient.objects.all()
    serializer_class = ProductIngredientSerializer
    permission_classes = [IsAdminUser]

# Vistas para contenido dinámico
class HeroSectionViewSet(viewsets.ModelViewSet):
    queryset = HeroSection.objects.filter(is_active=True)
    serializer_class = HeroSectionSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'active']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Obtener la sección hero activa"""
        hero = HeroSection.objects.filter(is_active=True).first()
        if hero:
            serializer = self.get_serializer(hero, context={'request': request})
            return Response(serializer.data)
        return Response({'error': 'No hay sección hero activa'}, status=status.HTTP_404_NOT_FOUND)

class AboutSectionViewSet(viewsets.ModelViewSet):
    queryset = AboutSection.objects.filter(is_active=True)
    serializer_class = AboutSectionSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'active']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Obtener la sección about activa"""
        about = AboutSection.objects.filter(is_active=True).first()
        if about:
            serializer = self.get_serializer(about, context={'request': request})
            return Response(serializer.data)
        return Response({'error': 'No hay sección about activa'}, status=status.HTTP_404_NOT_FOUND)

class ContactInfoViewSet(viewsets.ModelViewSet):
    queryset = ContactInfo.objects.filter(is_active=True)
    serializer_class = ContactInfoSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'active']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Obtener la información de contacto activa"""
        contact = ContactInfo.objects.filter(is_active=True).first()
        if contact:
            serializer = self.get_serializer(contact, context={'request': request})
            return Response(serializer.data)
        return Response({'error': 'No hay información de contacto activa'}, status=status.HTTP_404_NOT_FOUND)

class FeaturedProductViewSet(viewsets.ModelViewSet):
    queryset = FeaturedProduct.objects.filter(is_active=True)
    serializer_class = FeaturedProductSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'active']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Obtener el producto destacado activo"""
        featured = FeaturedProduct.objects.filter(is_active=True).first()
        if featured:
            serializer = self.get_serializer(featured, context={'request': request})
            return Response(serializer.data)
        return Response({'error': 'No hay producto destacado activo'}, status=status.HTTP_404_NOT_FOUND)

# ViewSet para reseñas
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.filter(is_approved=True, is_visible=True)
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        if self.action in ['create']:
            return [IsAuthenticated()]
        # updates y delete solo admin
        return [IsAdminUser()]

    def get_queryset(self):
        user = getattr(self.request, 'user', None)
        # Para acciones de detalle/admin (incluye nuestra acción custom set_visibility), usar queryset sin filtros
        if getattr(self, 'action', None) in ['retrieve', 'partial_update', 'update', 'destroy', 'set_visibility'] and user and user.is_staff:
            return Review.objects.all()

        qs = super().get_queryset()
        include_all = self.request.query_params.get('include_all')
        if include_all in ['1', 'true', 'yes'] and user and user.is_staff:
            return Review.objects.all()
        return qs

    def perform_create(self, serializer):
        # Asociar automáticamente el usuario autenticado y opcionalmente el pedido
        order = None
        order_id = self.request.data.get('order_id')
        if order_id and str(order_id).isdigit():
            try:
                order = Order.objects.get(id=order_id, user=self.request.user)
            except Order.DoesNotExist:
                order = None
        serializer.save(user=self.request.user, order=order, is_approved=True)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminUser])
    def set_visibility(self, request, pk=None):
        review = self.get_object()
        is_visible = request.data.get('is_visible')
        if is_visible is None:
            return Response({'detail': 'is_visible es requerido'}, status=status.HTTP_400_BAD_REQUEST)
        review.is_visible = bool(is_visible) if isinstance(is_visible, bool) else str(is_visible).lower() in ['1', 'true', 't', 'yes', 'y']
        review.save()
        return Response({'id': review.id, 'is_visible': review.is_visible})

# ViewSet para configuración global del sitio (singleton)
class SiteConfigViewSet(viewsets.ModelViewSet):
    queryset = SiteConfig.objects.all()
    serializer_class = SiteConfigSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]

    def list(self, request, *args, **kwargs):
        obj, _ = SiteConfig.objects.get_or_create(id=1)
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        obj, _ = SiteConfig.objects.get_or_create(id=1)
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        obj, _ = SiteConfig.objects.get_or_create(id=1)
        serializer = self.get_serializer(obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

# VIEWSETS PARA PEDIDOS
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    def get_permissions(self):
        # Permisos por acción:
        # - create: cualquiera puede crear pedido
        # - my: usuarios autenticados pueden ver sus propios pedidos
        # - otras acciones (list/retrieve/update/delete): solo admins
        if self.action == 'create':
            permission_classes = [AllowAny]
        elif self.action == 'my':
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer
    
    def create(self, request, *args, **kwargs):
        """Crear un nuevo pedido"""
        print("=== DATOS RECIBIDOS EN EL VIEWSET ===")
        print(f"Request data: {request.data}")
        
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            order = serializer.save()
            # Asociar el usuario autenticado si existe (checkout con usuario)
            if request.user and request.user.is_authenticated:
                order.user = request.user
                order.save()
            
            # Retornar el pedido creado con el serializer de lectura
            response_serializer = OrderSerializer(order, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        except ValidationError as e:  # CORREGIDO: usar ValidationError directamente
            print(f"Error de validación: {e}")
            print(f"Errores del serializer: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            print(f"Error inesperado: {e}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Error interno del servidor: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my(self, request):
        """Listar los pedidos del usuario autenticado"""
        qs = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderSerializer(qs, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Actualizar el estado de un pedido"""
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Order.STATUS_CHOICES):
            return Response(
                {'error': 'Estado inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = new_status
        order.save()
        
        serializer = self.get_serializer(order)
        return Response(serializer.data)
    
    def get_queryset(self):
        """Filtrar pedidos por estado si se especifica"""
        queryset = Order.objects.all().order_by('-created_at')
        status_filter = self.request.query_params.get('status', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset

    @action(detail=False, methods=['get'])
    def admin_stats(self, request):
        """Estadísticas para dashboard admin (últimos 30 días). Requiere IsAdminUser por get_permissions."""
        now = timezone.now()
        # Permitir filtrar por rango: day (1), week (7), month (30)
        range_param = (request.query_params.get('range') or '').lower()
        if range_param == 'day':
            days = 1
        elif range_param == 'week':
            days = 7
        else:
            # default month
            days = 30
        # Para incluir el día actual, restamos days-1
        start_date = now - timedelta(days=days - 1)

        # Pedidos: por hora si day, por día en otros rangos
        if days == 1:
            from django.db.models.functions import TruncHour
            # Ventana móvil de últimas 24 horas, terminando en la hora actual
            current_hour_local = timezone.localtime(now).replace(minute=0, second=0, microsecond=0)
            start_hour_local = current_hour_local - timedelta(hours=23)
            # Convertir a UTC (o zona activa) para filtrar correctamente en DB
            start_dt = timezone.make_aware(start_hour_local.replace(tzinfo=None)) if timezone.is_naive(start_hour_local) else start_hour_local
            end_dt = timezone.make_aware(current_hour_local.replace(tzinfo=None)) if timezone.is_naive(current_hour_local) else current_hour_local

            ob_qs = (
                Order.objects.filter(created_at__gte=start_dt, created_at__lte=end_dt)
                .annotate(hour=TruncHour('created_at'))
                .values('hour')
                .annotate(count=Count('id'))
                .order_by('hour')
            )
            # Construir lista por índice 0..23
            counts = [0] * 24
            for row in ob_qs:
                local_hour = timezone.localtime(row['hour']).replace(minute=0, second=0, microsecond=0)
                idx = int((local_hour - start_hour_local).total_seconds() // 3600)
                if 0 <= idx < 24:
                    counts[idx] = int(row['count'] or 0)
            orders_by_day = [
                {'date': (start_hour_local + timedelta(hours=i)).isoformat(), 'count': counts[i]}
                for i in range(24)
            ]
        else:
            orders_by_day_qs = (
                Order.objects.filter(created_at__date__gte=start_date.date())
                .annotate(day=TruncDate('created_at'))
                .values('day')
                .annotate(count=Count('id'))
                .order_by('day')
            )
            orders_by_day = [{'date': o['day'].isoformat(), 'count': o['count']} for o in orders_by_day_qs]

        # Ingresos: por hora si day, por día en otros rangos (excluye cancelados)
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
            totals = [0.0] * 24
            for row in rbd_qs:
                local_hour = timezone.localtime(row['hour']).replace(minute=0, second=0, microsecond=0)
                idx = int((local_hour - start_hour_local).total_seconds() // 3600)
                if 0 <= idx < 24:
                    totals[idx] = float(row['total'] or 0)
            revenue_by_day = [
                {'date': (start_hour_local + timedelta(hours=i)).isoformat(), 'total': totals[i]}
                for i in range(24)
            ]
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

        # Top productos por cantidad (últimas 24h si day, si no últimos N días)
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

        # Usuarios registrados (User.date_joined)
        User = get_user_model()
        if days == 1:
            from django.db.models.functions import TruncHour
            current_hour_local = timezone.localtime(now).replace(minute=0, second=0, microsecond=0)
            start_hour_local = current_hour_local - timedelta(hours=23)
            start_dt = timezone.make_aware(start_hour_local.replace(tzinfo=None)) if timezone.is_naive(start_hour_local) else start_hour_local
            end_dt = timezone.make_aware(current_hour_local.replace(tzinfo=None)) if timezone.is_naive(current_hour_local) else current_hour_local

            ubd_qs = (
                User.objects.filter(date_joined__gte=start_dt, date_joined__lte=end_dt)
                .annotate(hour=TruncHour('date_joined'))
                .values('hour')
                .annotate(count=Count('id'))
                .order_by('hour')
            )
            ucounts = [0] * 24
            for row in ubd_qs:
                local_hour = timezone.localtime(row['hour']).replace(minute=0, second=0, microsecond=0)
                idx = int((local_hour - start_hour_local).total_seconds() // 3600)
                if 0 <= idx < 24:
                    ucounts[idx] = int(row['count'] or 0)
            users_by_day = [
                {'date': (start_hour_local + timedelta(hours=i)).isoformat(), 'count': ucounts[i]}
                for i in range(24)
            ]
        else:
            ubd_qs = (
                User.objects.filter(date_joined__date__gte=start_date.date())
                .annotate(day=TruncDate('date_joined'))
                .values('day')
                .annotate(count=Count('id'))
                .order_by('day')
            )
            users_by_day = [{'date': r['day'].isoformat(), 'count': int(r['count'] or 0)} for r in ubd_qs]

        return Response({
            'ordersByDay': orders_by_day,
            'revenueByDay': revenue_by_day,
            'statusDistribution': status_distribution,
            'topProducts': top_products,
            'usersByDay': users_by_day,
            'rangeDays': days,
        })

# ViewSet de usuarios para estadísticas dedicadas
class UserViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """Usuarios registrados agrupados por hora (día) o por día (semana/mes)."""
        now = timezone.now()
        range_param = (request.query_params.get('range') or '').lower()
        if range_param == 'day':
            days = 1
        elif range_param == 'week':
            days = 7
        else:
            days = 30

        start_date = now - timedelta(days=days - 1)
        User = get_user_model()

        if days == 1:
            from django.db.models.functions import TruncHour
            current_hour_local = timezone.localtime(now).replace(minute=0, second=0, microsecond=0)
            start_hour_local = current_hour_local - timedelta(hours=23)
            start_dt = timezone.make_aware(start_hour_local.replace(tzinfo=None)) if timezone.is_naive(start_hour_local) else start_hour_local
            end_dt = timezone.make_aware(current_hour_local.replace(tzinfo=None)) if timezone.is_naive(current_hour_local) else current_hour_local

            qs = (
                User.objects.filter(date_joined__gte=start_dt, date_joined__lte=end_dt)
                .annotate(hour=TruncHour('date_joined'))
                .values('hour')
                .annotate(count=Count('id'))
                .order_by('hour')
            )
            counts = [0] * 24
            for row in qs:
                local_hour = timezone.localtime(row['hour']).replace(minute=0, second=0, microsecond=0)
                idx = int((local_hour - start_hour_local).total_seconds() // 3600)
                if 0 <= idx < 24:
                    counts[idx] = int(row['count'] or 0)
            users_by_day = [
                {'date': (start_hour_local + timedelta(hours=i)).isoformat(), 'count': counts[i]}
                for i in range(24)
            ]
        else:
            qs = (
                User.objects.filter(date_joined__date__gte=start_date.date())
                .annotate(day=TruncDate('date_joined'))
                .values('day')
                .annotate(count=Count('id'))
                .order_by('day')
            )
            users_by_day = [{'date': r['day'].isoformat(), 'count': int(r['count'] or 0)} for r in qs]

        return Response({'usersByDay': users_by_day, 'rangeDays': days})
