#!/bin/bash

# Script para iniciar el entorno de desarrollo
echo "🚀 Iniciando entorno de desarrollo..."

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

# Instalar dependencias de Node.js si no están instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias de Node.js..."
    npm install
fi

# Iniciar servidor backend
echo "🔧 Iniciando servidor backend (Django)..."
cd backend
python3 manage.py runserver 8000 &
BACKEND_PID=$!
cd ..

# Esperar un momento para que el backend se inicie
sleep 3

# Iniciar servidor frontend
echo "🎨 Iniciando servidor frontend (Vite)..."
npm run dev &
FRONTEND_PID=$!

echo "✅ Servidores iniciados:"
echo "   Backend: http://localhost:8000"
echo "   Frontend: http://localhost:5173"
echo "   Admin Django: http://localhost:8000/admin"
echo ""
echo "Presiona Ctrl+C para detener ambos servidores"

# Esperar a que ambos procesos terminen
wait 