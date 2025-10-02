#!/usr/bin/env python3
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fastfood.settings')
django.setup()

from products.models import Category, Product, ProductTag

def create_sample_data():
    # Crear categorías
    categories_data = [
        {'name': 'Hamburguesas', 'icon': '🍔'},
        {'name': 'Pizzas', 'icon': '🍕'},
        {'name': 'Bebidas', 'icon': '🥤'},
        {'name': 'Postres', 'icon': '🍰'},
        {'name': 'Acompañamientos', 'icon': '🍟'},
    ]
    
    categories = {}
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'icon': cat_data['icon']}
        )
        categories[cat_data['name']] = category
        print(f"Categoría {'creada' if created else 'ya existe'}: {category.name}")
    
    # Crear productos sin imágenes
    products_data = [
        {
            'name': 'Hamburguesa Clásica',
            'description': 'Hamburguesa con carne de res, lechuga, tomate, cebolla y queso cheddar',
            'price': 12.99,
            'category': 'Hamburguesas',
            'tags': ['Popular', 'Clásica']
        },
        {
            'name': 'Hamburguesa BBQ',
            'description': 'Hamburguesa con salsa BBQ, cebolla caramelizada y bacon',
            'price': 15.99,
            'category': 'Hamburguesas',
            'tags': ['BBQ', 'Bacon']
        },
        {
            'name': 'Pizza Margherita',
            'description': 'Pizza tradicional con salsa de tomate, mozzarella y albahaca',
            'price': 18.99,
            'category': 'Pizzas',
            'tags': ['Tradicional', 'Vegetariana']
        },
        {
            'name': 'Pizza Pepperoni',
            'description': 'Pizza con pepperoni, mozzarella y salsa de tomate',
            'price': 20.99,
            'category': 'Pizzas',
            'tags': ['Popular', 'Pepperoni']
        },
        {
            'name': 'Coca Cola',
            'description': 'Refresco Coca Cola 500ml',
            'price': 3.99,
            'category': 'Bebidas',
            'tags': ['Refresco', 'Popular']
        },
        {
            'name': 'Limonada Natural',
            'description': 'Limonada natural preparada con limones frescos',
            'price': 4.99,
            'category': 'Bebidas',
            'tags': ['Natural', 'Refrescante']
        },
        {
            'name': 'Papas Fritas',
            'description': 'Papas fritas crujientes con sal',
            'price': 6.99,
            'category': 'Acompañamientos',
            'tags': ['Crujiente', 'Popular']
        },
        {
            'name': 'Aros de Cebolla',
            'description': 'Aros de cebolla empanizados y fritos',
            'price': 7.99,
            'category': 'Acompañamientos',
            'tags': ['Crujiente', 'Vegetariano']
        },
        {
            'name': 'Tiramisú',
            'description': 'Postre italiano con café, mascarpone y cacao',
            'price': 8.99,
            'category': 'Postres',
            'tags': ['Italiano', 'Café']
        },
        {
            'name': 'Brownie',
            'description': 'Brownie de chocolate con nueces',
            'price': 6.99,
            'category': 'Postres',
            'tags': ['Chocolate', 'Nueces']
        }
    ]
    
    for product_data in products_data:
        category = categories[product_data['category']]
        
        # Crear producto sin imagen
        product, created = Product.objects.get_or_create(
            name=product_data['name'],
            defaults={
                'description': product_data['description'],
                'price': product_data['price'],
                'category': category,
                # No se asigna imagen - queda vacío para que el admin la suba
            }
        )
        
        if created:
            # Crear tags para el producto
            for tag_name in product_data['tags']:
                ProductTag.objects.get_or_create(
                    product=product,
                    name=tag_name
                )
            print(f"Producto creado: {product.name}")
        else:
            print(f"Producto ya existe: {product.name}")

if __name__ == '__main__':
    print("Poblando base de datos con datos de ejemplo...")
    create_sample_data()
    print("¡Datos de ejemplo creados exitosamente!")
    print("NOTA: Los productos se han creado sin imágenes. Usa el panel de administración para subir las imágenes localmente.")