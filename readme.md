## Guia de uso
### 1. Requisitos
- Node.js 18+ (recomendado 20+)
- npm (o pnpm/yarn si prefieres)Markdown
- Windows / macOS / Linux

### 2. Clonar el proyecto
```
git clone <URL-DE-TU-REPO>
cd restaurant-pos
```
### 3. Variables de entorno
#### 3.1. Backend → server/.env
```
PORT=3001
DB_DIALECT=sqlite
DB_STORAGE=../database/restaurant.db
JWT_SECRET=mi_clave_super_secreta
```

#### 3.2. Frontend → /.env (en la RAÍZ)
- Crea el archivo .env (en la raíz del proyecto, NO en /server ni /src) con:
```
VITE_API_URL=http://localhost:3001/api
```

### 4. Instalar dependencias
#### 4.1. Frontend (raíz)
```
npm install
```

#### 4.2. Backend
```
cd server
npm install
```

### 5. Base de datos (SQLite)
- Asegúrate de tener la carpeta:
```
restaurant-pos/
  database/
    restaurant.db   (puede estar vacío; se crea/usa automáticamente)
```

#### 5.1. Crear/actualizar admin (opcional pero recomendado)
- Desde la raíz del proyecto server:

- Re-hash en sitio (1 comando)
```
node -e "const {sequelize,Usuario}=require('./models');(async()=>{await sequelize.authenticate();const b=require('bcryptjs');const hash=await b.hash('admin123',10);await Usuario.update({password:hash,rol:'admin',email:'admin@restaurant.com'},{where:{email:'admin@restaurant.com'}});const u=await Usuario.findOne({where:{email:'admin@restaurant.com'}});console.log({email:u?.email,rol:u?.rol,passLen:u?.password?.length});process.exit(0)})()"
```
- Verifica que compara bien:
```
node -e "const {sequelize,Usuario}=require('./models');(async()=>{await sequelize.authenticate();const u=await Usuario.findOne({where:{email:'admin@restaurant.com'}});const b=require('bcryptjs');console.log({exists:!!u,rol:u?.rol,compare:u?await b.compare('admin123',u.password):null});process.exit(0)})()"
```
```
node server\scripts\create-admin.js
```

- Credenciales por defecto del admin:
    - Email: admin@restaurant.com
    - Password: admin123

### 6. Ejecutar en desarrollo
#### 6.1. Backend
- En una terminal:
```
cd server
npm run dev
npm run seed:admin → crea/actualiza admin (equivalente a ejecutar server/scripts/create-admin.js)
npm start
```

#### 6.2. Front
- En una terminal:
```
cd server
npm run dev

npm run build → genera /dist
npm run preview → vista previa de /dist
npm run electron:dev → Electron en dev (usa Vite)
npm run electron:build → build de instalador (Electron Builder)
```
# Desarrollo (Frontend + Backend + Electron)
```
cd restaurant-pos
npm run dev
```

### 7. Electron (App de escritorio)
#### 7.1 Dev (con backend separado)
- Usa 3 terminales:
1. Backend:
```
cd server
npm run dev
```  

2. Frontend:
```
cd restaurant-pos
npm run dev
``` 

3. Electron(desde la raiz)
```
npm run electron:dev
``` 

## Instalaciones
Electron
npm install electron electron-builder --save-dev

### React + Vite
npm install react react-dom
npm install -D vite @vitejs/plugin-react

### Routing
npm install react-router-dom

### Estado global
npm install zustand

### Backend
npm install express cors

### Base de datos
npm install sequelize sqlite3

### Utilidades
npm install axios dayjs

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

npm install react-icons

### Instalar Librería de Impresión

npm install electron-pos-printer

### Instalar Generación de PDF

npm install pdfmake

### Instalar Herramientas de Desarrollo

npm install -D concurrently nodemo