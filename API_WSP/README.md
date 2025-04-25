# API_WSP - Sistema de Reclamos Lavex

Este proyecto es una aplicación móvil desarrollada con React Native y Expo para gestionar reclamos de máquinas de lavado y secado.

## Requisitos Previos

- Node.js v16.0.0 o superior
- npm v7.0.0 o superior
- Expo CLI (instalado localmente en el proyecto)

## Versiones de Dependencias

```json
{
  "expo": "~49.0.15",
  "react": "18.2.0",
  "react-native": "0.72.6",
  "expo-image-picker": "~14.3.2",
  "expo-status-bar": "~1.6.0",
  "react-native-safe-area-context": "4.6.3",
  "styled-components": "^6.1.17",
  "react-native-web": "~0.19.6",
  "react-dom": "18.2.0",
  "@expo/webpack-config": "^19.0.0"
}
```

## Estructura del Proyecto

```
API_WSP/
├── ReclamosApp/           # Aplicación principal
│   ├── src/              # Código fuente
│   │   ├── components/   # Componentes React
│   │   ├── config/       # Configuraciones
│   │   ├── hooks/        # Custom hooks
│   │   ├── styles/       # Estilos
│   │   ├── theme/        # Tema de la aplicación
│   │   ├── types/        # Tipos TypeScript
│   │   └── utils/        # Utilidades
│   ├── assets/           # Recursos estáticos
│   └── .expo/            # Configuración de Expo
```

## Instalación

1. Clona el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd API_WSP/ReclamosApp
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el proyecto:
```bash
npx expo start
```

## Flujo de la Aplicación

1. **Inicio de la Aplicación**
   - La aplicación se inicia en `App.tsx`
   - Se carga el formulario principal desde `FormularioReclamos.tsx`

2. **Formulario de Reclamos**
   - El usuario ingresa:
     - ID de la máquina
     - Tipo de máquina (Lavadora/Secadora)
     - Número de máquina
     - Tipo de problema
     - Información adicional según el tipo de problema

3. **Tipos de Problemas**
   - Out of Order, Overflow, EFL
   - Pagó app y no se activó
   - Pago app y marcó saldo deficiente
   - Recargó monedero y no se acredita
   - Las monedas caen mal
   - Ropa mal lavada
   - Secadora no secó
   - Solicita revisión técnica

4. **Envío de Reclamos**
   - Los datos se envían a través de WhatsApp
   - Se incluyen fotos según el tipo de problema
   - Se genera un mensaje estructurado con toda la información

## Configuración de WhatsApp

El número de WhatsApp y el formato del mensaje se configuran en:
```
src/config/whatsapp.ts
```

## Ejecución del Proyecto

Para iniciar el proyecto, asegúrate de estar en el directorio correcto:

```bash
cd API_WSP/ReclamosApp
npx expo start
```

Opciones de ejecución:
- Para web: `npx expo start --web`
- Para Android: `npx expo start --android`
- Para iOS: `npx expo start --ios`

## Solución de Problemas Comunes

1. **Error de Dependencias**
   ```bash
   npx expo install react-native@0.72.10
   ```

2. **Error de Caché**
   ```bash
   npm cache clean --force
   rm -r node_modules
   npm install
   ```

3. **Error de Versión de Node**
   - Asegúrate de tener Node.js v16 o superior
   - Usa nvm para gestionar versiones de Node si es necesario

## Notas Importantes

- El proyecto usa TypeScript para mejor tipado y mantenibilidad
- Las imágenes se manejan con expo-image-picker
- Los estilos se gestionan con styled-components
- La configuración de webpack se maneja con @expo/webpack-config

## Contribución

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request 