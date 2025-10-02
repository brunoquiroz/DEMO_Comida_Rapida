# DEMO Comida Rápida - Sistema de Gestión

Un sistema completo de gestión para restaurantes de comida rápida con frontend en React + TypeScript y backend en Django REST Framework, **con el admin de Django integrado directamente en React**.

## Descripción breve

Aplicación web para mostrar un catálogo de productos (hamburguesas, pizzas, bebidas), permitir a los usuarios armar su pedido con extras, gestionar el carrito y completar un checkout. Incluye panel de administración para gestionar contenido (hero, destacados, contacto, etc.), productos, categorías y más. Funciona en modo DEMO sin backend o conectado a una API real.

## Características

### Frontend (React + TypeScript)
- Interfaz moderna y responsiva con Tailwind CSS
- Sistema de autenticación completo
- **Panel de administración integrado con Django Admin**
- Gestión de productos y categorías
- Sistema de notificaciones toast
- Navegación con React Router
- Context API para estado global
- **Admin de Django embebido en React**

### Backend (Django REST Framework)
- API REST completa
- Autenticación con tokens
- Gestión de productos y categorías
- Subida de imágenes
- Filtros y búsqueda
- **Panel de administración Django integrado**
- CORS configurado para desarrollo
- **Contenido dinámico gestionable**

## Funcionalidades de la aplicación

- **[Catálogo y navegación]**
  - Listado por categorías (`Hamburguesas`, `Pizzas`, `Bebidas`).
  - Búsqueda/filtrado (según API en modo real).
  - Sección hero dinámica con título, subtítulo, CTA e imagen de fondo.

- **[Carrito y personalización]**
  - Agregar productos al carrito desde el menú o destacados.
  - Personalizar con ingredientes extra y cantidades con precios adicionales.
  - Actualizar cantidades, eliminar ítems y ver subtotal/total en tiempo real.
  - Botón flotante de carrito y cajón (drawer) con detalle completo.

- **[Checkout y pedidos]**
  - Formulario de checkout con datos del cliente y dirección.
  - Generación de pedido con cálculo total y resumen de extras.
  - Página “Mis pedidos” para que el usuario vea su historial.

- **[Autenticación y roles]**
  - Inicio de sesión y registro.
  - Redirección automática a panel si el usuario es administrador.
  - Modo DEMO: cualquier usuario; si el nombre incluye "admin" se considera administrador.

- **[Panel de administración]**
  - Dashboard con métricas demo (órdenes, ingresos, usuarios, etc.).
  - Gestión de Hero Section, Producto Destacado, Contacto y más.
  - Acceso directo al Django Admin integrado desde el panel.

- **[UI/UX y extras]**
  - Diseño responsive con TailwindCSS.
  - Botón de WhatsApp de contacto.
  - Toasts de notificaciones para acciones y errores.
  - Enlaces rápidos arriba a la derecha: Ir al Admin, Registrarse, Ver pedidos.
- [ ] App móvil
- [ ] **Editor visual para contenido dinámico**
- [ ] **Sistema de roles y permisos avanzado** 
