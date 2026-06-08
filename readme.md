# 🍽️ Restaurant POS — Sistema de Pedidos y Facturación

Sistema de punto de venta para restaurantes con frontend en React + Vite, backend en Express + SQLite y empaquetado con Electron.

---

## 📋 Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| **Node.js** | 18+ (recomendado 20+) |
| **npm** | 9+ (incluido con Node) |
| **Git** | cualquier versión reciente |
| **SO** | Windows / macOS / Linux |

---

## 🚀 Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone <URL-DE-TU-REPO>
cd PedidosProyecto
```

---

### 2. Variables de entorno

#### 2.1 Backend → `server/.env`

Copia el archivo de ejemplo y ajusta los valores si lo necesitas:

```bash
cp server/.env.example server/.env
```

Contenido de referencia:

```env
PORT=3001
DB_DIALECT=sqlite
DB_STORAGE=../../database/restaurant.db
JWT_SECRET=mi_clave_super_secreta

EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password
```

#### 2.2 Frontend → `.env` (raíz del proyecto)

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Contenido de referencia:

```env
VITE_API_URL=http://localhost:3001/api
```

> ⚠️ **Importante:** El `.env` del frontend va en la **raíz** del proyecto, **NO** dentro de `/server` ni `/src`.

---

### 3. Instalar dependencias

#### 3.1 Frontend (desde la raíz del proyecto)

```bash
npm install
```

#### 3.2 Backend (desde la carpeta `server`)

```bash
cd server
npm install
```

> 💡 Después de instalar vuelve a la raíz con `cd ..` si vas a seguir ejecutando comandos.

---

### 4. Base de datos (SQLite)

La base de datos se crea automáticamente. Solo asegúrate de que exista la carpeta `database/` en la raíz:

```
PedidosProyecto/
├── database/
│   └── restaurant.db   ← se crea/usa automáticamente
├── server/
├── src/
└── ...
```

Si la carpeta no existe, créala:

```bash
mkdir database
```

---

## 🛠️ Scripts disponibles

### Scripts del Backend (`server/`)

> Todos estos comandos se ejecutan **desde la carpeta `server/`**.

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor en modo producción |
| `npm run dev` | Inicia el servidor con **nodemon** (reinicio automático en cambios) |
| `npm run seed:admin` | Crea o actualiza el usuario **administrador** |
| `npm run seed` | Ejecuta el seeder general |
| `npm run db:reset` | Resetea la base de datos por completo |

### Scripts del Frontend (raíz `/`)

> Todos estos comandos se ejecutan **desde la raíz del proyecto**.

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo de Vite (frontend) |
| `npm run build` | Genera el bundle de producción en `/dist` |
| `npm run preview` | Vista previa local del build de producción |
| `npm run server` | Inicia solo el backend desde la raíz |
| `npm run server:dev` | Inicia solo el backend con nodemon desde la raíz |
| `npm run electron:dev` | Abre Electron en modo desarrollo |
| `npm run electron:build` | Construye el instalador de Electron |

---

## 👤 Crear usuarios (Admin y Cajero)

### Crear / actualizar el Administrador

Desde la carpeta `server/`:

```bash
cd server
npm run seed:admin
```

O directamente con node:

```bash
cd server
node scripts/create-admin.js
```

| Campo | Valor por defecto |
|-------|-------------------|
| **Nombre** | Admin |
| **Email** | admin@restaurant.com |
| **Password** | admin123 |
| **Rol** | admin |

> Si el admin ya existe, el script lo actualiza (re-hashea la contraseña).

---

### Crear / actualizar un Cajero

Desde la carpeta `server/`:

```bash
cd server
node scripts/create-cajero.js
```

| Campo | Valor por defecto |
|-------|-------------------|
| **Nombre** | OperadoraX |
| **Email** | cajero@restaurant.com |
| **Password** | cajero123 |
| **Rol** | cajero |

> 📝 Para cambiar el nombre, email o contraseña del cajero, edita los valores directamente en el archivo `server/scripts/create-cajero.js` antes de ejecutarlo.

El cajero inicia sesión con su **nombre de usuario** y **contraseña**, y luego elige turno **AM** o **PM**.

---

### Resetear el Administrador (forzar re-creación)

Si el admin tiene problemas (contraseña incorrecta, rol cambiado, etc.):

```bash
cd server
node scripts/reset-admin.js
```

Este script fuerza la actualización del admin con las credenciales por defecto.

---

### Limpiar tablas de backup de SQLite

Si la base de datos tiene tablas `_backup` residuales:

```bash
cd server
node scripts/cleanupSqliteBackups.js
```

---

## ▶️ Ejecutar en modo desarrollo

Necesitas **2 terminales** abiertas simultáneamente:

### Terminal 1 — Backend

```bash
cd server
npm run dev
```

El servidor estará disponible en: `http://localhost:3001`

### Terminal 2 — Frontend

```bash
npm run dev
```

La app estará disponible en: `http://localhost:5173`

---

## 🖥️ Electron (App de escritorio)

### Modo desarrollo (3 terminales)

1. **Terminal 1 — Backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Terminal 2 — Frontend:**
   ```bash
   npm run dev
   ```

3. **Terminal 3 — Electron (desde la raíz):**
   ```bash
   npm run electron:dev
   ```

### Construir instalador

```bash
npm run electron:build
```

---

## 📦 Dependencias del proyecto

### Frontend (raíz)

| Paquete | Uso |
|---------|-----|
| `react`, `react-dom` | Framework UI |
| `react-router-dom` | Navegación / Routing |
| `zustand` | Estado global |
| `axios` | Peticiones HTTP al backend |
| `dayjs` | Manejo de fechas |
| `lucide-react`, `react-icons` | Iconos |
| `pdfmake` | Generación de PDF |
| `electron-pos-printer` | Impresión POS |
| `tailwindcss`, `postcss`, `autoprefixer` | Estilos (CSS utility-first) |
| `vite`, `@vitejs/plugin-react` | Bundler / Dev server |
| `electron`, `electron-builder` | App de escritorio |
| `concurrently`, `nodemon`, `cross-env` | Herramientas de desarrollo |

### Backend (`server/`)

| Paquete | Uso |
|---------|-----|
| `express` | Framework HTTP |
| `cors` | Manejo de CORS |
| `sequelize` | ORM para base de datos |
| `sqlite3` | Driver de SQLite |
| `bcryptjs` | Hash de contraseñas |
| `jsonwebtoken` | Autenticación JWT |
| `dotenv` | Variables de entorno |
| `nodemailer` | Envío de emails |
| `nodemon` | Reinicio automático (dev) |

---

## 📁 Estructura del proyecto

```
PedidosProyecto/
├── database/              # Base de datos SQLite
│   └── restaurant.db
├── electron/              # Configuración de Electron
├── public/                # Assets estáticos
├── server/                # ⬅️ Backend (Express + Sequelize)
│   ├── config/            #    Configuración de BD
│   ├── controllers/       #    Controladores de rutas
│   ├── middlewares/        #    Middlewares (auth, etc.)
│   ├── models/            #    Modelos de Sequelize
│   ├── routes/            #    Definición de rutas
│   ├── scripts/           #    ⬅️ Scripts utilitarios
│   │   ├── create-admin.js
│   │   ├── create-cajero.js
│   │   ├── reset-admin.js
│   │   ├── initDb.js
│   │   └── cleanupSqliteBackups.js
│   ├── services/          #    Lógica de negocio
│   ├── utils/             #    Utilidades
│   ├── index.js           #    Punto de entrada del servidor
│   └── package.json
├── src/                   # ⬅️ Frontend (React + Vite)
├── .env                   #    Variables de entorno (frontend)
├── package.json           #    Dependencias del frontend
├── vite.config.js
├── tailwind.config.js
└── readme.md
```