#!/usr/bin/env python3
import os
import django

# Configurar Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fastfood.settings')
django.setup()

from api.models import HeroSection, AboutSection, ContactInfo, FeaturedProduct

def create_content_data():
    # Crear Hero Section
    hero_data = {
        'title': 'Sabor que conquista corazones',
        'subtitle': 'Descubre la mejor comida rápida de la ciudad. Ingredientes frescos, sabores auténticos y un servicio que te hará volver una y otra vez.',
        'button_text': 'Ordenar Ahora',
        'button_url': '#menu',
        'is_active': True
    }
    
    hero, created = HeroSection.objects.get_or_create(
        title=hero_data['title'],
        defaults=hero_data
    )
    print(f"Hero Section {'creada' if created else 'ya existe'}: {hero.title}")
    
    # Crear About Section
    about_data = {
        'title': 'Comida rápida con alma y sabor',
        'subtitle': 'Somos más que una empresa de comida rápida',
        'description': 'Creemos que cada bocado debe ser una experiencia memorable, donde la rapidez no compromete la calidad, y el sabor urbano se encuentra con la tradición culinaria.',
        'years_experience': 5,
        'is_active': True
    }
    
    about, created = AboutSection.objects.get_or_create(
        title=about_data['title'],
        defaults=about_data
    )
    print(f"About Section {'creada' if created else 'ya existe'}: {about.title}")
    
    # Crear Contact Info
    contact_data = {
        'phone': '+56 9 1234 5678',
        'email': 'info@fastfooddeluxe.cl',
        'address': 'Av. Providencia 123, Providencia, Santiago, Chile',
        'whatsapp': '+56 9 1234 5678',
        'facebook': 'https://facebook.com/fastfooddeluxe',
        'instagram': 'https://instagram.com/fastfooddeluxe',
        'is_active': True
    }
    
    contact, created = ContactInfo.objects.get_or_create(
        phone=contact_data['phone'],
        defaults=contact_data
    )
    print(f"Contact Info {'creada' if created else 'ya existe'}: {contact.phone}")
    
    # Crear Featured Product sin imagen
    featured_data = {
        'name': 'Combo Familiar Deluxe',
        'description': 'El combo perfecto para compartir en familia. Incluye 4 hamburguesas clásicas, papas familiares, 4 bebidas grandes y salsa extra. Una experiencia gastronómica que une a toda la familia.',
        'price': 49900,
        'original_price': 65000,
        'discount_percentage': 23,
        'preparation_time': '15-20 min',
        'servings': '4 personas',
        'rating': 4.9,
        'reviews_count': 150,
        'is_active': True
        # No se asigna imagen - queda vacío para que el admin la suba
    }
    
    featured, created = FeaturedProduct.objects.get_or_create(
        name=featured_data['name'],
        defaults=featured_data
    )
    print(f"Featured Product {'creado' if created else 'ya existe'}: {featured.name}")

if __name__ == '__main__':
    print("Poblando contenido dinámico...")
    create_content_data()
    print("¡Contenido dinámico creado exitosamente!")
    print("NOTA: Los elementos se han creado sin imágenes. Usa el panel de administración para subir las imágenes localmente.")