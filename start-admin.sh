#!/bin/bash

# Script para iniciar el sistema con admin integrado
echo "🚀 Iniciando sistema con admin integrado..."

# Función para limpiar procesos al salir
cleanup() {
    echo "🛑 Deteniendo servidores..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Capturar señales de interrupción
trap cleanup SIGINT SIGTERM

# Verificar si estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Debes ejecutar este script desde el directorio raíz del proyecto"
    exit 1
fi

# Verificar si existe el entorno virtual
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python3 -m venv venv
fi

# Activar entorno virtual
echo "🔧 Activando entorno virtual..."
source venv/bin/activate

# Instalar dependencias de Python si no están instaladas
if [ ! -f "backend/db.sqlite3" ]; then
    echo "📦 Instalando dependencias de Python..."
    pip install -r requirements.txt
fi

# Verificar si existe superusuario
echo "👤 Verificando superusuario..."
cd backend
if ! python3 manage.py shell -c "from django.contrib.auth.models import User; print('Superusuario existe' if User.objects.filter(is_superuser=True).exists() else 'No hay superusuario')" 2>/dev/null | grep -q "Superusuario existe"; then
    echo "⚠️  No hay superusuario creado."
    echo "💡 Para crear un superusuario, ejecuta:"
    echo "   cd backend && python3 manage.py createsuperuser"
    echo ""
    read -p "¿Deseas crear un superusuario ahora? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        python3 manage.py createsuperuser
    fi
fi

# Poblar datos si no existen
if [ ! -f "populate_data.py" ]; then
    echo "📊 Poblando datos de ejemplo..."
    python3 populate_data.py
fi

if [ ! -f "populate_content.py" ]; then
    echo "📝 Poblando contenido dinámico..."
    python3 populate_content.py
fi

# Iniciar servidor backend
echo "🔧 Iniciando servidor backend (Django)..."
python3 manage.py runserver 8000 &
BACKEND_PID=$!
cd ..

# Esperar un momento para que el backend se inicie
sleep 3

# Verificar que el backend esté funcionando
echo "🔍 Verificando backend..."
if curl -s http://localhost:8000/api/categories/ > /dev/null; then
    echo "✅ Backend funcionando correctamente"
else
    echo "❌ Error: Backend no está respondiendo"
    echo "💡 Verifica que el puerto 8000 esté disponible"
    exit 1
fi

# Instalar dependencias de Node.js si no están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias de Node.js..."
    npm install
fi

# Iniciar servidor frontend
echo "🎨 Iniciando servidor frontend (React)..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Sistema iniciado exitosamente!"
echo ""
echo "🌐 URLs de acceso:"
echo "   Frontend: http://localhost:5173"
echo "   Admin React: http://localhost:5173/admin"
echo "   Admin Django: http://localhost:8000/admin"
echo "   API Backend: http://localhost:8000/api/"
echo ""
echo "🔑 Credenciales de acceso:"
echo "   Usuario: admin (o el que hayas creado)"
echo "   Contraseña: (la que configuraste al crear el superusuario)"
echo ""
echo "📋 Funcionalidades disponibles:"
echo "   • Panel de administración integrado"
echo "   • Gestión completa de productos y categorías"
echo "   • Contenido dinámico gestionable"
echo "   • Admin de Django embebido en React"
echo ""
echo "🔄 Los cambios en el admin de Django se reflejan automáticamente en el frontend"
echo ""
echo "Presiona Ctrl+C para detener ambos servidores"

# Esperar a que ambos procesos terminen
wait 