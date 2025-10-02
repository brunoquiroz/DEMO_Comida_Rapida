"""
URL configuration for fastfood project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from api.views import (
    CategoryViewSet, ProductViewSet, ProductTagViewSet,
    HeroSectionViewSet, AboutSectionViewSet, ContactInfoViewSet, FeaturedProductViewSet,
    IngredientViewSet, ProductIngredientViewSet, OrderViewSet, ReviewViewSet, SiteConfigViewSet, UserViewSet
)
from api.auth import login_view, logout_view, register_view
from api.admin_dashboard import dashboard_data

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'tags', ProductTagViewSet)
router.register(r'hero', HeroSectionViewSet)
router.register(r'about', AboutSectionViewSet)
router.register(r'contact', ContactInfoViewSet)
router.register(r'featured', FeaturedProductViewSet)
router.register(r'ingredients', IngredientViewSet)
router.register(r'product-ingredients', ProductIngredientViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'site-config', SiteConfigViewSet, basename='site-config')
router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    path('admin/dashboard-data/', dashboard_data, name='admin-dashboard-data'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/login/', login_view, name='login'),
    path('api/auth/logout/', logout_view, name='logout'),
    path('api/auth/register/', register_view, name='register'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
