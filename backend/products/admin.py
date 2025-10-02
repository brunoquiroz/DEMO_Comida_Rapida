from django.contrib import admin
from .models import Category, Product, ProductTag, Ingredient, ProductIngredient

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon']
    search_fields = ['name']
    list_filter = ['name']

class ProductTagInline(admin.TabularInline):
    model = ProductTag
    extra = 1

class ProductIngredientInline(admin.TabularInline):
    model = ProductIngredient
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'is_active', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ProductTagInline, ProductIngredientInline]
    list_editable = ['is_active']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('name', 'description', 'price', 'category')
        }),
        ('Imagen', {
            'fields': ('image',)
        }),
        ('Estado', {
            'fields': ('is_active',)
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

@admin.register(ProductTag)
class ProductTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'product']
    search_fields = ['name', 'product__name']
    list_filter = ['product__category']

@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']
