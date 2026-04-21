# Backoffice Operativo — Viajes Altairis

Backoffice web fullstack para la gestion de hoteles, habitaciones, disponibilidad y reservas de Viajes Altairis.

## Stack

| Capa | Tecnologia |
|---|---|
| Backend | ASP.NET Core 8 + Entity Framework Core |
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Base de Datos | PostgreSQL 16 |
| Infraestructura | Docker Compose |

## Como ejecutar

**Requisito unico:** tener [Docker](https://docs.docker.com/get-docker/) instalado.

```bash
git clone https://github.com/GabrielVinhati/Viajes_Altairis.git
cd Viajes_Altairis
./start.sh
```

El script construye las imagenes, levanta los contenedores, espera a que esten listos y muestra las URLs de acceso.

- **Frontend:** http://localhost:4173
- **Backend API:** http://localhost:4174/api
- **Swagger:** http://localhost:4174/swagger

## Para detener

```bash
docker compose down
```

Para resetear la base de datos (borrar todos los datos y recrear desde el seed):

```bash
docker compose down -v
./start.sh
```

## Tests

```bash
cd frontend
npm install --legacy-peer-deps
npm test
```

## Funcionalidades

- **Dashboard** — KPIs, grafico de ocupacion, reservas por estado, top hoteles
- **Hoteles** — CRUD con busqueda, paginacion, filtros
- **Habitaciones** — Tipos de habitacion por hotel, busqueda, tarjetas
- **Disponibilidad** — Grilla visual con colores segun nivel de ocupacion
- **Reservas** — CRUD con busqueda, filtro por estado, actualizacion de estado
- Eliminacion de hotel cancela reservas activas automaticamente
- Validaciones con mensajes de error en espanol
- Animacion de carga al abrir la aplicacion
- Diseno responsivo (sidebar mobile)
