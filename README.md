# 🏆 ConquistaLogros

Una aplicación web para gestionar objetivos personales y alcanzar tus metas de forma organizada y motivadora.

## 🎯 Descripción

ConquistaLogros es una plataforma que te permite:
- **Crear y gestionar objetivos** personales
- **Seguir tu progreso** de forma visual
- **Organizar tareas** relacionadas con tus metas
- **Acceso administrativo** para gestión avanzada

## 🚀 Características

- ✅ **Autenticación segura** con Firebase Auth
- ✅ **Verificación de email** obligatoria
- ✅ **Dashboard personalizado** para cada usuario
- ✅ **Panel de administración** para gestión avanzada
- ✅ **Interfaz responsive** y moderna
- ✅ **Base de datos en tiempo real** con Firebase
- ✅ **Despliegue automático** en Firebase Hosting

## 🛠️ Tecnologías

- **Frontend**: React.js + Vite
- **Backend**: Firebase Functions
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Estilos**: CSS-in-JS (styled components inline)

## 📋 Requisitos

- Node.js (v16 o superior)
- npm o yarn
- Firebase CLI
- Cuenta de Firebase

## 🔧 Instalación

1. **Clonar el repositorio:**
```bash
git clone <url-del-repositorio>
cd objetivos-web
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar Firebase:**
   - Crear un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilitar Authentication (Email/Password)
   - Habilitar Firestore Database
   - Habilitar Firebase Functions
   - Copiar la configuración a `src/firebase.js`

4. **Configurar Firebase CLI:**
```bash
npm install -g firebase-tools
firebase login
firebase init
```

## 🚀 Desarrollo Local

```bash
# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:5173
```

## 🔥 Despliegue

### Despliegue completo (desde cero):

1. **Construir aplicación:**
```bash
# Instalar dependencias si es necesario
npm install

# Construir la aplicación para producción
npm run build
```

2. **Desplegar las funciones:**
```bash
# Desplegar solo las functions primero
firebase deploy --only functions
```

3. **Desplegar el frontend:**
```bash
# Desplegar el hosting (frontend)
firebase deploy --only hosting
```

4. **Verificar que funcione:**
```bash
# Listar los sitios de hosting
firebase hosting:sites:list
```

### Redespliegues rápidos:

```bash
# Redesplegar SOLO functions:
firebase deploy --only functions

# Redesplegar SOLO frontend:
npm run build && firebase deploy --only hosting
```

## 👥 Usuarios

### Usuario Regular
- Acceso al dashboard personal
- Gestión de objetivos propios
- Seguimiento de progreso

### Administrador
- **Email**: `conquistalogros@gmail.com`
- Acceso al panel de administración
- Gestión completa de usuarios y objetivos
- Estadísticas globales

## 🔒 Seguridad

- **Verificación de email obligatoria** antes del acceso
- **Autenticación Firebase** con tokens seguros
- **Validación de roles** en frontend y backend
- **Reglas de seguridad** en Firestore

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── DashboardSettings.jsx
│   ├── MainContainer.jsx
│   ├── ObjectivesDonutChart.jsx
│   └── ProgressChart.jsx
├── hooks/              # Custom hooks
│   └── useObjectives.jsx
├── pages/              # Páginas principales
│   ├── Admin.jsx       # Panel de administración
│   ├── Dashboard.jsx   # Dashboard del usuario
│   ├── Login.jsx       # Autenticación
│   └── Register.jsx    # Registro de usuarios
├── services/           # Servicios de datos
│   └── userService.jsx
├── App.jsx            # Componente principal y rutas
└── firebase.js        # Configuración Firebase
```

## 🐛 Solución de Problemas

### Error de verificación de email
- Revisar bandeja de entrada y spam
- Usar el botón "Reenviar Verificación"
- Verificar configuración de Firebase Auth

### Error de despliegue
- Verificar que Firebase CLI esté actualizado
- Comprobar permisos del proyecto Firebase
- Revisar logs con `firebase logs`

### Error de desarrollo local
- Verificar que el puerto 5173 esté libre
- Reinstalar dependencias: `rm -rf node_modules && npm install`
- Verificar configuración de Firebase

## 📝 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run preview      # Vista previa del build
```

## 🎓 Contexto Académico

Este proyecto fue desarrollado como Trabajo Final de Grado, demostrando:
- Desarrollo full-stack con tecnologías modernas
- Implementación de sistemas de autenticación seguros
- Diseño de interfaces de usuario responsivas
- Integración con servicios en la nube (Firebase)
- Arquitectura de componentes escalable

---

**¡Alcanza tus objetivos, conquista tus sueños! 🎯**