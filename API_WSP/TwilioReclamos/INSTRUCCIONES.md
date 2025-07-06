# 📋 Instrucciones Paso a Paso - TwilioReclamos WhatsApp

## 🚀 Configuración Inicial

### 1. Prerequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Expo CLI: `npm install -g expo-cli`
- Cuenta de Twilio (gratuita)

### 2. Instalación de Dependencias

#### Frontend (App móvil):
```bash
cd TwilioReclamos
npm install
```

#### Backend:
```bash
cd TwilioReclamos/backend
npm install
```

## 📱 Configuración de Twilio WhatsApp

### Paso 1: Crear Cuenta en Twilio

1. Ve a [console.twilio.com](https://console.twilio.com)
2. Crea una cuenta gratuita
3. Verifica tu número de teléfono

### Paso 2: Configurar WhatsApp Sandbox

1. En el panel de Twilio, ve a **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Encontrarás un número como `+1 415 523 8886`
3. Desde tu teléfono, envía un mensaje a ese número con el código que te aparece (ejemplo: `join shoulder-fairly`)
4. Deberías recibir una confirmación de que tu número está conectado al sandbox

### Paso 3: Obtener Credenciales

1. En el panel de Twilio, ve a **Settings** → **General**
2. Copia tu **Account SID** y **Auth Token**
3. Guarda estos datos, los necesitarás para el backend

### Paso 4: Configurar Variables de Entorno

Crea un archivo `.env` en la carpeta `TwilioReclamos/backend/`:

```env
# Credenciales de Twilio
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
TWILIO_AUTH_TOKEN=tu_auth_token_aqui

# Números de WhatsApp
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TARGET_WHATSAPP_NUMBER=whatsapp:+56958292939

# Configuración del servidor
PORT=3000
NODE_ENV=development
```

**⚠️ IMPORTANTE**: Reemplaza `+56958292939` con tu número de teléfono en formato internacional (sin espacios ni guiones).

## 🏃‍♂️ Ejecución del Proyecto

### 1. Iniciar el Backend

```bash
cd TwilioReclamos/backend
npm start
```

Deberías ver:
```
🚀 Servidor corriendo en puerto 3000
📱 Webhook URL: http://localhost:3000/webhook
🔗 URL de salud: http://localhost:3000/health
```

### 2. Probar el Backend

Abre otra terminal y prueba:
```bash
curl http://localhost:3000/health
```

### 3. Iniciar la App Móvil

```bash
cd TwilioReclamos
npm start
```

Esto abrirá Expo Developer Tools en tu navegador.

## 📱 Probar la Aplicación

### Opción 1: Expo Go (Recomendado)

1. Instala Expo Go en tu teléfono
2. Escanea el código QR desde Expo Developer Tools
3. La app se cargará en tu teléfono

### Opción 2: Simulador Web

1. En Expo Developer Tools, haz clic en "Run in web browser"
2. La app se abrirá en tu navegador

## 📋 Flujo de Prueba

### 1. Llenar el Formulario

1. Abre la app
2. Llena los campos requeridos:
   - ID de Máquina: `LAV001`
   - Tipo de Máquina: Selecciona "Lavadora"
   - Número de Máquina: `5`
   - Tipo de Problema: Selecciona cualquier opción

### 2. Enviar Reclamo

1. Presiona "Enviar por WhatsApp"
2. La app intentará enviar via API
3. Si funciona, verás un mensaje de éxito
4. Si falla, te ofrecerá abrir WhatsApp directamente

### 3. Verificar Recepción

1. Revisa tu WhatsApp
2. Deberías recibir un mensaje con los detalles del reclamo
3. Podrás responder normalmente por WhatsApp

## 🔧 Configuración Avanzada

### Configurar Webhook (Opcional)

Para recibir respuestas de WhatsApp en tu backend:

1. Instala ngrok:
   ```bash
   npm install -g ngrok
   ```

2. Expón tu servidor local:
   ```bash
   ngrok http 3000
   ```

3. Copia la URL https que te da ngrok
4. En Twilio Console, ve a **Messaging** → **Settings** → **WhatsApp sandbox settings**
5. Configura el webhook:
   - URL: `https://tu-url-ngrok.ngrok.io/webhook`
   - Método: POST

### Configurar Número de Producción

Para usar un número real de WhatsApp Business:

1. En Twilio Console, ve a **Messaging** → **Senders** → **WhatsApp senders**
2. Solicita un número de WhatsApp Business
3. Sigue el proceso de verificación de Facebook
4. Actualiza las variables de entorno con el nuevo número

## 🚨 Solución de Problemas

### Error: "TWILIO_ACCOUNT_SID is not defined"

**Solución**: Verifica que el archivo `.env` esté en la carpeta `backend/` y tenga las credenciales correctas.

### Error: "Cannot find module 'expo-image-picker'"

**Solución**: 
```bash
cd TwilioReclamos
npm install expo-image-picker
```

### WhatsApp no se abre automáticamente

**Solución**: 
1. Asegúrate de que WhatsApp esté instalado
2. Verifica que tu número esté registrado en el sandbox
3. Intenta usar el botón "Abrir WhatsApp" cuando aparezca

### Backend no responde

**Solución**:
1. Verifica que el servidor esté corriendo en puerto 3000
2. Prueba: `curl http://localhost:3000/health`
3. Revisa los logs del servidor

### Mensajes no llegan

**Solución**:
1. Verifica que tu número esté registrado en el sandbox
2. Asegúrate de que el TARGET_WHATSAPP_NUMBER esté correcto
3. Revisa los logs del servidor para errores

## 📊 Monitoreando el Sistema

### Logs del Backend

Para ver los logs en tiempo real:
```bash
cd TwilioReclamos/backend
npm run dev
```

### Estado de Twilio

Prueba la conexión con Twilio:
```bash
curl http://localhost:3000/twilio-status
```

### Mensajes Enviados

En Twilio Console, ve a **Messaging** → **Logs** → **Messaging logs** para ver todos los mensajes enviados.

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. **Personaliza el mensaje**: Edita `src/config/twilio.ts`
2. **Agrega más campos**: Modifica `src/types/FormTypes.ts`
3. **Mejora la UI**: Edita `src/components/FormularioReclamos.tsx`
4. **Deploy**: Sigue las instrucciones de despliegue en README.md

¡Listo! 🎉 Tu aplicación de reclamos con WhatsApp está funcionando.

## 📞 Soporte

Si tienes problemas, revisa:
1. Los logs del backend
2. Los logs de Expo
3. El estado de Twilio
4. La configuración del sandbox

¿Necesitas ayuda? Abre un issue en el repositorio. 🚀 