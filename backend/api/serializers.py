from rest_framework import serializers
from products.models import Category, Product, ProductTag, Ingredient, ProductIngredient
from .models import HeroSection, AboutSection, ContactInfo, FeaturedProduct, Order, OrderItem, OrderItemExtra, OrderItemIngredient, Review, SiteConfig

class ProductTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductTag
        fields = ['id', 'name']

class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'products_count']
    
    def get_products_count(self, obj):
        return obj.products.filter(is_active=True).count()

# NUEVOS SERIALIZERS PARA INGREDIENTES
class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'is_active']

class ProductIngredientSerializer(serializers.ModelSerializer):
    ingredient = IngredientSerializer(read_only=True)
    ingredient_id = serializers.PrimaryKeyRelatedField(
        source='ingredient', queryset=Ingredient.objects.all(), write_only=True
    )

    class Meta:
        model = ProductIngredient
        fields = ['id', 'ingredient', 'ingredient_id', 'default_included', 'extra_cost', 'is_active']

class ProductSerializer(serializers.ModelSerializer):
    tags = ProductTagSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    image_url = serializers.SerializerMethodField()
    product_ingredients = ProductIngredientSerializer(many=True, required=False)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'category', 'category_name', 
                 'category_icon', 'image', 'image_url', 'is_active', 'tags', 'product_ingredients', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None

# SERIALIZER PARA RESEÑAS
class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    order_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Review
        fields = ['id', 'username', 'rating', 'comment', 'created_at', 'order_id', 'is_visible']

    def get_username(self, obj):
        if obj.user and obj.user.username:
            name = obj.user.username
            # Anonimizar parcialmente (primera letra + '.')
            return f"{name[0].upper()}." if len(name) > 0 else 'Anónimo'
        return 'Anónimo'

class SiteConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteConfig
        fields = ['id', 'show_reviews', 'updated_at']

class ProductDetailSerializer(ProductSerializer):
    category = CategorySerializer(read_only=True)
    
    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ['category']

# Serializers para contenido dinámico
class HeroSectionSerializer(serializers.ModelSerializer):
    background_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = HeroSection
        fields = ['id', 'title', 'subtitle', 'button_text', 'button_url', 
                 'background_image', 'background_image_url', 'is_active', 'created_at', 'updated_at']
    
    def get_background_image_url(self, obj):
        if obj.background_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.background_image.url)
        return None

class AboutSectionSerializer(serializers.ModelSerializer):
    image_1_url = serializers.SerializerMethodField()
    image_2_url = serializers.SerializerMethodField()
    
    class Meta:
        model = AboutSection
        fields = ['id', 'title', 'subtitle', 'description', 'image_1', 'image_1_url',
                 'image_2', 'image_2_url', 'years_experience', 'is_active', 'created_at', 'updated_at']
    
    def get_image_1_url(self, obj):
        if obj.image_1:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_1.url)
        return None
    
    def get_image_2_url(self, obj):
        if obj.image_2:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image_2.url)
        return None

class ContactInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInfo
        fields = ['id', 'phone', 'email', 'address', 'whatsapp', 
                 'facebook', 'instagram', 'is_active', 'created_at', 'updated_at']

class FeaturedProductSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    discount_amount = serializers.ReadOnlyField()
    discount_percentage_calculated = serializers.ReadOnlyField()
    
    class Meta:
        model = FeaturedProduct
        fields = ['id', 'name', 'description', 'price', 'original_price', 'discount_percentage',
                 'image', 'image_url', 'preparation_time', 'servings', 'rating', 'reviews_count',
                 'discount_amount', 'discount_percentage_calculated', 'is_active', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return None

# SERIALIZERS PARA PEDIDOS
class OrderItemExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItemExtra
        fields = ['id', 'ingredient', 'ingredient_name', 'quantity', 'unit_price', 'total_price']

class OrderItemIngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItemIngredient
        fields = ['id', 'ingredient', 'ingredient_name', 'is_included', 'was_default']

class OrderItemSerializer(serializers.ModelSerializer):
    extras = OrderItemExtraSerializer(many=True, read_only=True)
    ingredients = OrderItemIngredientSerializer(many=True, read_only=True)  # Nuevo campo
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_description', 'quantity', 
                 'unit_price', 'total_price', 'extras', 'ingredients']  # Agregado 'ingredients'

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'customer_name', 'customer_email', 'customer_phone',
                 'delivery_address', 'delivery_street', 'delivery_number', 'delivery_apartment',
                 'delivery_city', 'delivery_region', 'notes', 'status', 'total_amount',
                 'created_at', 'updated_at', 'items']
        read_only_fields = ['order_number', 'created_at', 'updated_at']

class CreateOrderSerializer(serializers.Serializer):
    # Información del cliente
    customer_name = serializers.CharField(max_length=200)
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField(max_length=20)
    
    # Dirección de entrega
    delivery_street = serializers.CharField(max_length=200)
    delivery_number = serializers.CharField(max_length=20)
    delivery_apartment = serializers.CharField(max_length=100, required=False, allow_blank=True)
    delivery_city = serializers.CharField(max_length=100)
    delivery_region = serializers.CharField(max_length=100)
    
    # Información del pedido
    notes = serializers.CharField(required=False, allow_blank=True)
    
    # Items del pedido - CORREGIDO: permitir diccionarios anidados
    items = serializers.ListField(
        child=serializers.DictField()  # Removido child=serializers.CharField()
    )
    
    def validate(self, data):
        """Validar los datos antes de crear la orden"""
        print("=== DATOS RECIBIDOS EN EL SERIALIZER ===")
        print(f"Data completa: {data}")
        print(f"Items: {data.get('items', [])}")
        
        # Validar que hay items
        items = data.get('items', [])
        if not items:
            raise serializers.ValidationError("Debe incluir al menos un item en el pedido")
        
        # Validar cada item
        for i, item in enumerate(items):
            print(f"Item {i}: {item}")
            
            # Verificar que el producto existe
            product_id = item.get('product_id')
            if not product_id:
                raise serializers.ValidationError(f"Item {i}: product_id es requerido")
            
            try:
                from products.models import Product
                product = Product.objects.get(id=product_id)
                print(f"Producto encontrado: {product.name}")
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Item {i}: Producto con ID {product_id} no existe")
            except ValueError:
                raise serializers.ValidationError(f"Item {i}: product_id debe ser un número válido")
            
            # Verificar quantity
            quantity = item.get('quantity')
            if not quantity:
                raise serializers.ValidationError(f"Item {i}: quantity es requerido")
            
            try:
                quantity_int = int(quantity)
                if quantity_int <= 0:
                    raise serializers.ValidationError(f"Item {i}: quantity debe ser mayor a 0")
            except ValueError:
                raise serializers.ValidationError(f"Item {i}: quantity debe ser un número válido")
        
        return data
    
    def create(self, validated_data):
        print("=== CREANDO ORDEN ===")
        print(f"Validated data: {validated_data}")
        
        items_data = validated_data.pop('items')
        
        # Crear la dirección completa
        delivery_address = f"{validated_data['delivery_street']} {validated_data['delivery_number']}"
        if validated_data.get('delivery_apartment'):
            delivery_address += f", {validated_data['delivery_apartment']}"
        delivery_address += f", {validated_data['delivery_city']}, {validated_data['delivery_region']}"
        
        validated_data['delivery_address'] = delivery_address
        
        # Calcular el total del pedido
        total_amount = 0
        
        # Crear el pedido
        order = Order.objects.create(**validated_data, total_amount=0)
        print(f"Orden creada con ID: {order.id}")
        
        # Crear los items del pedido
        for item_data in items_data:
            print(f"Procesando item: {item_data}")
            
            from products.models import Product, ProductIngredient
            product = Product.objects.get(id=item_data['product_id'])
            quantity = int(item_data['quantity'])
            
            # Calcular precio unitario (precio base + extras)
            unit_price = float(product.price)
            
            # Procesar extras si existen
            extras_data = item_data.get('extras', {})
            extras_total = 0
            
            for ingredient_id, extra_quantity in extras_data.items():
                if int(extra_quantity) > 0:
                    try:
                        product_ingredient = ProductIngredient.objects.get(
                            product=product, 
                            ingredient_id=ingredient_id
                        )
                        extras_total += float(product_ingredient.extra_cost) * int(extra_quantity)
                    except ProductIngredient.DoesNotExist:
                        print(f"ProductIngredient no encontrado para producto {product.id} e ingrediente {ingredient_id}")
                        continue
            
            unit_price += extras_total
            total_price = unit_price * quantity
            
            # Crear el item del pedido
            order_item = OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                product_description=product.description,
                quantity=quantity,
                unit_price=unit_price,
                total_price=total_price
            )
            print(f"OrderItem creado: {order_item.id}")
            
            # Crear los extras del item
            for ingredient_id, extra_quantity in extras_data.items():
                if int(extra_quantity) > 0:
                    try:
                        product_ingredient = ProductIngredient.objects.get(
                            product=product, 
                            ingredient_id=ingredient_id
                        )
                        ingredient = product_ingredient.ingredient
                        extra_unit_price = float(product_ingredient.extra_cost)
                        extra_total_price = extra_unit_price * int(extra_quantity)
                        
                        OrderItemExtra.objects.create(
                            order_item=order_item,
                            ingredient=ingredient,
                            ingredient_name=ingredient.name,
                            quantity=int(extra_quantity),
                            unit_price=extra_unit_price,
                            total_price=extra_total_price
                        )
                        print(f"OrderItemExtra creado para ingrediente {ingredient.name}")
                    except ProductIngredient.DoesNotExist:
                        print(f"ProductIngredient no encontrado para extra: producto {product.id}, ingrediente {ingredient_id}")
                        continue
            
            # Crear los ingredientes del item (incluidos/excluidos)
            from products.models import ProductIngredient
            product_ingredients = ProductIngredient.objects.filter(product=product, is_active=True)
            
            # Obtener ingredientes incluidos del frontend (si se envían)
            included_ingredients = item_data.get('included_ingredients', [])
            
            for product_ingredient in product_ingredients:
                ingredient = product_ingredient.ingredient
                was_default = product_ingredient.default_included
                
                # Si se enviaron ingredientes incluidos específicos, usar esa lista
                # Si no, usar los valores por defecto
                if included_ingredients:
                    is_included = str(ingredient.id) in included_ingredients
                else:
                    is_included = was_default
                
                OrderItemIngredient.objects.create(
                    order_item=order_item,
                    ingredient=ingredient,
                    ingredient_name=ingredient.name,
                    is_included=is_included,
                    was_default=was_default
                )
            
            total_amount += total_price
        
        # Actualizar el total del pedido
        order.total_amount = total_amount
        order.save()
        
        print(f"Orden completada con total: {total_amount}")
        return order