# 💬 TwilioReclamos - WhatsApp Integration

Una aplicación móvil para enviar reclamos directamente a WhatsApp usando Twilio API.

## 🚀 Características

- ✅ Formulario de reclamos interactivo
- 📱 Integración con WhatsApp Business
- 🖼️ Soporte para imágenes
- 🔄 Fallback a WhatsApp directo
- 📊 Diferentes tipos de problemas
- 💳 Soporte para diferentes métodos de pago

## 📁 Estructura del Proyecto

```
TwilioReclamos/
├── src/
│   ├── components/
│   │   └── FormularioReclamos.tsx
│   ├── config/
│   │   └── twilio.ts
│   ├── hooks/
│   │   └── useFormulario.ts
│   ├── services/
│   │   └── twilioWhatsAppService.ts
│   ├── theme/
│   │   └── colors.ts
│   ├── types/
│   │   └── FormTypes.ts
│   └── utils/
│       └── validation.ts
├── backend/
│   ├── server.js
│   └── package.json
├── App.tsx
├── package.json
└── README.md
```

## 🛠️ Instalación

### 1. Instalar dependencias de la app móvil

```bash
cd TwilioReclamos
npm install
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

## ⚙️ Configuración de Twilio

### 1. Crear cuenta en Twilio
1. Ve a [Twilio Console](https://console.twilio.com/)
2. Crea una cuenta gratuita
3. Obtén tu Account SID y Auth Token

### 2. Configurar WhatsApp Sandbox
1. En Twilio Console, ve a **Messaging > Try it out > Send a WhatsApp message**
2. Sigue las instrucciones para configurar el sandbox
3. Envía el mensaje de activación desde tu teléfono

### 3. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `backend/`:

```env
# Configuración de Twilio
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TARGET_WHATSAPP_NUMBER=whatsapp:+56958292939

# Configuración del servidor
PORT=3000
NODE_ENV=development
```

### 4. Configurar Webhook (Opcional)

Para recibir respuestas de WhatsApp:

1. Usa ngrok para exponer tu servidor local:
   ```bash
   ngrok http 3000
   ```

2. En Twilio Console, configura el webhook:
   - URL: `https://your-ngrok-url.ngrok.io/webhook`
   - Método: POST

## 🏃‍♂️ Ejecución

### 1. Ejecutar el backend

```bash
cd backend
npm start
```

El servidor estará corriendo en `http://localhost:3000`

### 2. Ejecutar la app móvil

```bash
cd TwilioReclamos
npm start
```

## 📱 Uso de la Aplicación

1. **Llenar el formulario**: Ingresa los datos del reclamo
2. **Adjuntar imágenes**: Selecciona fotos relevantes
3. **Enviar**: Presiona "Enviar por WhatsApp"
4. **Conversación automática**: Se abrirá WhatsApp con el servicio al cliente

## 🔧 Funcionalidades Principales

### Tipos de Problemas Soportados

- **Out of Order, Overflow, EFL**: Máquina fuera de servicio
- **Pagó app y no se activó**: Problemas de pago
- **Monedas caen mal**: Problemas con monedas
- **Revisión técnica**: Solicitud de mantenimiento

### Métodos de Pago

- 💳 Webpay - Tarjeta
- 📱 Webpay - One Pay
- 💰 Monedero

## 🛡️ Seguridad

- ✅ Validación completa de formularios
- 🔐 Credenciales en variables de entorno
- 🚫 Sin almacenamiento de credenciales en cliente
- 🔄 Fallback a WhatsApp directo

## 📊 API Endpoints

### Backend Endpoints

- `POST /send-whatsapp` - Enviar mensaje de WhatsApp
- `POST /webhook` - Recibir respuestas de WhatsApp
- `GET /health` - Estado del servidor
- `GET /twilio-status` - Estado de Twilio

### Ejemplo de uso de la API

```javascript
const response = await fetch('http://localhost:3000/send-whatsapp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'whatsapp:+56958292939',
    from: 'whatsapp:+14155238886',
    body: 'Mensaje de reclamo...',
    mediaUrls: ['https://example.com/image.jpg']
  })
});
```

## 🚀 Despliegue

### Despliegue del Backend

1. **Heroku** (Recomendado):
   ```bash
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

2. **Railway**:
   - Conecta tu repositorio
   - Configura las variables de entorno
   - Deploy automático

3. **DigitalOcean**:
   - Crea un droplet
   - Configura PM2 para el proceso
   - Configura nginx como proxy

### Despliegue de la App

1. **Expo Build**:
   ```bash
   expo build:android
   expo build:ios
   ```

2. **EAS Build**:
   ```bash
   eas build --platform all
   ```

## 🔍 Troubleshooting

### Problemas Comunes

1. **Error de conexión con Twilio**:
   - Verifica que las credenciales sean correctas
   - Asegúrate de que el sandbox esté configurado

2. **WhatsApp no se abre**:
   - Verifica que WhatsApp esté instalado
   - Comprueba los permisos de la app

3. **Imágenes no se envían**:
   - Verifica los permisos de galería
   - Asegúrate de que las URLs sean accesibles

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 📞 Soporte

Si tienes algún problema o pregunta, por favor abre un issue en el repositorio.

---

¡Gracias por usar TwilioReclamos! 💬✨ 