# 🦊 Star Fox 3 — Objeto Virtual de Aprendizaje (OVA)

Videojuego educativo web interactivo para el aprendizaje y dominio de las tablas de multiplicar y razonamiento matemático espacial, desarrollado con **SvelteKit 2**, **Svelte 5 (Runes)**, **Tailwind CSS v4** y **Firebase** (Auth + Firestore con Admin SDK).

---

## 🚀 Arquitectura del Proyecto

```
star-fox-3/
├── src/
│   ├── lib/
│   │   ├── assets/          # Íconos y recursos estáticos del juego
│   │   ├── audio/           # Sintetizador Web Audio API y efectos de sonido
│   │   ├── components/      # Componentes UI de Svelte 5
│   │   │   ├── activities/  # Simulador cadete y actividades pedagógicas
│   │   │   ├── game/        # Mecánicas del juego (meteoritos, cristales, barras)
│   │   │   ├── map/         # Mapa estelar interactivo, rutas y diálogos
│   │   │   ├── medals/      # Sistema de medallas y logros
│   │   │   ├── profile/     # Fichas de personaje y estadísticas
│   │   │   └── shop/        # Tienda de cosméticos y naves
│   │   ├── constants/       # Niveles, personajes, medallas y tienda
│   │   ├── firebase/        # Configuración Client de Firebase (Auth)
│   │   ├── server/          # Firebase Admin SDK, auth middleware y parser Excel
│   │   ├── stores/          # Stores reactivos Svelte 5 (game.svelte, session.svelte)
│   │   └── sync/            # Cola de eventos offline (outbox) y merge de progreso
│   ├── routes/              # Páginas y API endpoints de SvelteKit
│   │   ├── api/             # Endpoints seguros (telemetría, clases, roster, auth)
│   │   ├── map/             # Mapa principal y niveles de multiplicación
│   │   ├── minigames/       # Modos de velocidad, precisión y zen
│   │   ├── teacher/         # Portal del docente (gestión de cursos, import Excel)
│   │   ├── training/        # Simulador de práctica sin costo de energía
│   │   └── join/            # Flujo de conexión de alumnos con código y PIN
├── firestore.rules          # Reglas de seguridad (acceso restringido a Admin SDK)
├── .env.example             # Plantilla de variables de entorno documentadas
└── package.json
```

---

## ⚙️ Configuración de Variables de Entorno

El proyecto soporta tanto **modo local / offline** (progreso en `localStorage` sin necesidad de internet ni Firebase) como **modo conectado** (sincronización con Firebase para clases y telemetría de profesores).

1. Copia el archivo de ejemplo:
   ```sh
   cp .env.example .env
   ```

2. Configura las credenciales:

### 🌐 Frontend (Públicas):
```env
PUBLIC_FIREBASE_API_KEY=tu_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto
PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
```

### 🔒 Backend (Privadas — Solo Servidor):
Descarga tu JSON de servicio desde **Firebase Console > Project Settings > Service Accounts**:
```env
FIREBASE_PROJECT_ID=tu-proyecto
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

---

## 🛠️ Desarrollo

```sh
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Chequeo de tipos y sintaxis
npm run check

# Compilar para producción
npm run build
```

---

## 🛡️ Seguridad y Buenas Prácticas

1. **Firestore Rules:** El cliente web nunca lee ni escribe directamente en Firestore (`allow read, write: if false;`). Todo acceso a datos pasa por los endpoints de la API (`/api/*`) validados por Firebase Admin SDK.
2. **Resiliencia Offline:** El store de sesión y la cola de telemetría detectan automáticamente si Firebase está configurado o si el usuario pierde conexión, almacenando los eventos localmente hasta restablecer la red.
