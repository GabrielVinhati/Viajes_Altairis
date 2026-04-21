#!/bin/bash

echo ""
echo "  ╔══════════════════════════════════════════╗"
echo "  ║     Viajes Altairis - Backoffice         ║"
echo "  ╚══════════════════════════════════════════╝"
echo ""
echo "  Construyendo e iniciando los servicios..."
echo ""

docker compose up -d --build

echo ""
echo "  Esperando que los servicios estén listos..."

# Wait for backend to be ready
for i in $(seq 1 30); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:4174/api/dashboard 2>/dev/null | grep -q "200"; then
    break
  fi
  sleep 2
done

# Check if everything is up
BACKEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4174/api/dashboard 2>/dev/null)
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4173 2>/dev/null)

echo ""

if [ "$BACKEND" = "200" ] && [ "$FRONTEND" = "200" ] || [ "$FRONTEND" = "307" ]; then
  echo "  ✅ Todos los servicios están funcionando!"
  echo ""
  echo "  ┌──────────────────────────────────────────┐"
  echo "  │                                          │"
  echo "  │   Frontend:  http://localhost:4173        │"
  echo "  │   API:       http://localhost:4174/api    │"
  echo "  │   Swagger:   http://localhost:4174/swagger│"
  echo "  │                                          │"
  echo "  └──────────────────────────────────────────┘"
  echo ""
  echo "  Para detener: docker compose down"
  echo "  Para resetear: docker compose down -v && ./start.sh"
  echo ""
else
  echo "  ⚠️  Algunos servicios aún están iniciando."
  echo "  Ejecute 'docker compose ps' para verificar el estado."
  echo "  Los servicios estarán disponibles en:"
  echo ""
  echo "    http://localhost:4173        (Frontend)"
  echo "    http://localhost:4174/api    (API)"
  echo ""
fi
