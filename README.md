# Next.js Authentication Project

Este proyecto es una aplicación web basada en Next.js que implementa autenticación completa utilizando NextAuth.js, Prisma y PostgreSQL.

## Tecnologías utilizadas

- **Next.js 14**: Framework de React con Server Components
- **NextAuth.js**: Para autenticación con credenciales
- **Prisma**: ORM para interactuar con la base de datos
- **PostgreSQL**: Base de datos relacional
- **Tailwind CSS**: Para estilos
- **Docker**: Para contenerizar la base de datos

## Requisitos

- Node.js 18 o superior
- Docker y Docker Compose
- npm o yarn

## Configuración inicial

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd poc-auth-nextjs
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb?schema=public"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secreto-seguro-aqui
```

### 4. Iniciar la base de datos con Docker

```bash
docker-compose up -d
```

Este comando iniciará un contenedor de PostgreSQL con las credenciales configuradas en el archivo docker-compose.yml.

### 5. Ejecutar migraciones de Prisma

```bash
npx prisma migrate dev
```

Esto creará las tablas necesarias en la base de datos según el esquema definido en `prisma/schema.prisma`.

### 6. Generar el cliente de Prisma

```bash
npx prisma generate
```

## Ejecutar la aplicación

```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

```
├── prisma/               # Configuración y esquemas de Prisma
├── public/               # Archivos públicos
├── src/
│   ├── app/              # Rutas y pages de Next.js
│   │   ├── api/          # API routes (NextAuth, registro de usuarios)
│   │   ├── auth/         # Páginas de autenticación (login, registro)
│   │   └── dashboard/    # Área protegida
│   ├── components/       # Componentes reutilizables
│   │   └── Navbar.tsx    # Barra de navegación
│   └── libs/             # Utilidades (conexión a DB, etc)
├── .env                  # Variables de entorno
├── docker-compose.yml    # Configuración de Docker
└── tailwind.config.ts    # Configuración de Tailwind
```

## Funcionalidades

- **Registro de usuarios**: Los usuarios pueden crear una cuenta con nombre de usuario, correo electrónico y contraseña
- **Autenticación**: Login con correo y contraseña
- **Protección de rutas**: Las rutas protegidas solo son accesibles para usuarios autenticados
- **UI adaptativa**: La interfaz se adapta según el estado de autenticación del usuario

## Solución de problemas comunes

### Error con Server y Client Components

Si encuentras errores como:
```
Error: Event handlers cannot be passed to Client Component props.
```

Asegúrate de que los componentes que utilizan hooks o manejadores de eventos estén marcados con `'use client'` al inicio del archivo.

### Problemas con Prisma

Si tienes problemas con Prisma, puedes reiniciar la base de datos y las migraciones con:

```bash
npx prisma migrate reset
```

### Problemas con Docker

Si la base de datos no se conecta correctamente:

```bash
# Detener los contenedores
docker-compose down

# Eliminar volúmenes
docker-compose down -v

# Iniciar de nuevo
docker-compose up -d
```

## Notas de desarrollo

- El formulario de registro incluye validación del lado del cliente utilizando react-hook-form
- Las contraseñas se almacenan hasheadas en la base de datos usando bcrypt
- El navbar muestra opciones diferentes según el estado de autenticación del usuario

## Próximas mejoras

- Añadir proveedores de autenticación social (Google, GitHub)
- Implementar recuperación de contraseña
- Añadir perfiles de usuario
- Mejorar la experiencia móvil
