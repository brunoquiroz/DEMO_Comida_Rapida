from django.db import models
from products.models import Product, Ingredient
from django.contrib.auth.models import User
import uuid

# Create your models here.

class HeroSection(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.TextField()
    button_text = models.CharField(max_length=100, default="Ordenar Ahora")
    button_url = models.CharField(max_length=200, default="#menu")
    background_image = models.ImageField(upload_to='hero/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Hero Section"
        verbose_name_plural = "Hero Sections"
    
    def __str__(self):
        return f"Hero Section - {self.title}"

class AboutSection(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.TextField()
    description = models.TextField()
    image_1 = models.ImageField(upload_to='about/', blank=True, null=True)
    image_2 = models.ImageField(upload_to='about/', blank=True, null=True)
    years_experience = models.IntegerField(default=5)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "About Section"
        verbose_name_plural = "About Sections"
    
    def __str__(self):
        return f"About Section - {self.title}"

class ContactInfo(models.Model):
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()
    whatsapp = models.CharField(max_length=20, blank=True, null=True)
    facebook = models.URLField(blank=True, null=True)
    instagram = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Contact Info"
        verbose_name_plural = "Contact Info"
    
    def __str__(self):
        return f"Contact Info - {self.phone}"

class FeaturedProduct(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    discount_percentage = models.IntegerField(default=0)
    image = models.ImageField(upload_to='featured/', blank=True, null=True)
    preparation_time = models.CharField(max_length=50, default="15-20 min")
    servings = models.CharField(max_length=50, default="4 personas")
    rating = models.DecimalField(max_digits=3, decimal_places=1, default=4.9)
    reviews_count = models.IntegerField(default=150)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Featured Product"
        verbose_name_plural = "Featured Products"
    
    def __str__(self):
        return f"Featured Product - {self.name}"
    
    @property
    def discount_amount(self):
        if self.original_price and self.price:
            return self.original_price - self.price
        return 0
    
    @property
    def discount_percentage_calculated(self):
        if self.original_price and self.price:
            return int(((self.original_price - self.price) / self.original_price) * 100)
        return 0

# MODELOS PARA PEDIDOS
class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('confirmed', 'Confirmado'),
        ('preparing', 'Preparando'),
        ('ready', 'Listo'),
        ('delivered', 'Entregado'),
        ('cancelled', 'Cancelado'),
    ]
    
    order_number = models.CharField(max_length=20, unique=True, editable=False)

    # Usuario (opcional: pedidos de invitado)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    
    # Información del cliente
    customer_name = models.CharField(max_length=200)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20)
    
    # Dirección de entrega
    delivery_address = models.TextField()
    delivery_street = models.CharField(max_length=200)
    delivery_number = models.CharField(max_length=20)
    delivery_apartment = models.CharField(max_length=100, blank=True, null=True)
    delivery_city = models.CharField(max_length=100)
    delivery_region = models.CharField(max_length=100)
    
    # Información del pedido
    notes = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
        ordering = ['-created_at']
    
    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generar número de pedido único
            self.order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Pedido {self.order_number} - {self.customer_name}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Información del producto al momento del pedido (para mantener historial)
    product_name = models.CharField(max_length=200)
    product_description = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Item de Pedido"
        verbose_name_plural = "Items de Pedido"
    
    def __str__(self):
        return f"{self.product_name} x{self.quantity} - {self.order.order_number}"

class OrderItemExtra(models.Model):
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='extras')
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Información del ingrediente al momento del pedido (para mantener historial)
    ingredient_name = models.CharField(max_length=100)
    
    class Meta:
        verbose_name = "Extra de Item"
        verbose_name_plural = "Extras de Items"
    
    def __str__(self):
        return f"{self.ingredient_name} x{self.quantity} - {self.order_item.product_name}"

class OrderItemIngredient(models.Model):
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='ingredients')
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    is_included = models.BooleanField(default=True)  # True = incluido, False = excluido
    was_default = models.BooleanField(default=False)  # Si era incluido por defecto
    
    # Información del ingrediente al momento del pedido
    ingredient_name = models.CharField(max_length=100)
    
    class Meta:
        verbose_name = "Ingrediente de Item"
        verbose_name_plural = "Ingredientes de Items"
        unique_together = ['order_item', 'ingredient']
    
    def __str__(self):
        status = "incluido" if self.is_included else "excluido"
        return f"{self.ingredient_name} ({status}) - {self.order_item.product_name}"

# Reseñas de clientes
class Review(models.Model):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True)
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    comment = models.TextField()
    is_approved = models.BooleanField(default=True)
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Reseña'
        verbose_name_plural = 'Reseñas'

    def __str__(self):
        username = self.user.username if self.user else 'Anónimo'
        return f"Review {self.rating}★ por {username}"

class SiteConfig(models.Model):
    show_reviews = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Configuración del sitio'
        verbose_name_plural = 'Configuración del sitio'

    def __str__(self):
        return 'Configuración del sitio'
