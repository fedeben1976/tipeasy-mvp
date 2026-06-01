# TipEasy — Propinas digitales por QR

La forma más fácil de dar y recibir propinas digitales.

## Setup local (Windows / Mac / Linux)

```bash
# 1. Clonar el repositorio
git clone https://github.com/fedeben1976/tipeasy-mvp
cd tipeasy-mvp
git checkout claude/tipeasy-app-build-qsYB5

# 2. Instalar dependencias (genera el cliente de Prisma automáticamente)
npm install

# 3. Crear el archivo de variables de entorno
cp .env.example .env

# 4. Crear la base de datos y cargar datos de demo
npm run setup

# 5. Iniciar el servidor
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

## Cuenta de demo

| Campo | Valor |
|-------|-------|
| Email | `juan@demo.com` |
| Contraseña | `demo1234` |
| Página pública | `http://localhost:3000/tip/juan-perez` |

## Flujo de demo para presentar

1. Abrí `http://localhost:3000/tip/juan-perez` (o escaneá el QR desde el dashboard)
2. Elegí un monto de propina
3. Tocá "Enviar propina"
4. En el simulador de pago, tocá "Aprobar pago"
5. Ves la pantalla de confirmación con animación

## Stack

- **Next.js 16** + TypeScript + Tailwind CSS
- **Prisma v7** + SQLite (local) / PostgreSQL (producción)
- **NextAuth.js** — autenticación
- **Mercado Pago** — integración de pagos (modo demo incluido)

## Variables de entorno

Ver `.env.example` para todas las variables disponibles.

Para conectar Mercado Pago real, agregar en `.env`:
```
MP_ACCESS_TOKEN=tu_access_token_de_mercadopago
```
