Para ejecutarlo en local:

npm run dev


Despliegue completo (desde cero):


1. Construir aplicación:

# Instalar dependencias si es necesario
npm install

# Construir la aplicación para producción
npm run build

2. Desplegar las funciones:

# Desplegar solo las functions primero
firebase deploy --only functions

3. Desplegar el frontend:

# Desplegar el hosting (frontend)
firebase deploy --only hosting

4. Verificar que funcione:

# Abrir la aplicación en el navegador
firebase open hosting:site




Redesplegar SOLO functions:

firebase deploy --only functions



Redesplegar SOLO frontend:

npm run build && firebase deploy --only hosting