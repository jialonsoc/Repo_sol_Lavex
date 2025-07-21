# 📋 INSTRUCCIONES DE CONFIGURACIÓN - GupshupReclamos

Guía paso a paso para configurar y ejecutar el sistema de reclamos con Gupshup WhatsApp Business API e IA Conversacional **con sistema completo de Webhooks**.

## 🎯 Objetivo

Implementar un sistema automatizado de reclamos que utiliza la IA conversacional de Gupshup para responder automáticamente a problemas comunes y escalar casos complejos a agentes humanos. **Incluye sistema bidireccional de mensajes con almacenamiento en base de datos**.

## 📋 Prerequisitos

### 1. Software Requerido

```bash
# Node.js (versión 16 o superior)
node --version  # Debe ser >= 16.0.0

# npm (incluido con Node.js)
npm --version

# Expo CLI
npm install -g @expo/cli

# PostgreSQL (para webhooks y almacenamiento)
psql --version

# Git (para clonar el proyecto)
git --version
```

### 2. Cuentas Necesarias

- ✅ **Cuenta Gupshup** (gratuita): https://www.gupshup.io/
- ✅ **Número de WhatsApp Business** (puede ser el mismo personal inicialmente)
- ✅ **Expo Account** (gratuito): https://expo.dev/
- ✅ **Base de datos PostgreSQL** (local o en la nube)

## 🗄️ Configuración de Base de Datos PostgreSQL

### Instalación Local de PostgreSQL

#### En Windows:
```bash
# Descargar desde: https://www.postgresql.org/download/windows/
# O usar Chocolatey:
choco install postgresql

# Crear base de datos
createdb gupshup_messages
```

#### En macOS:
```bash
# Usar Homebrew
brew install postgresql
brew services start postgresql

# Crear base de datos
createdb gupshup_messages
```

#### En Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Configurar usuario
sudo -u postgres createuser --interactive

# Crear base de datos
sudo -u postgres createdb gupshup_messages
```

### Base de Datos en la Nube (Alternativas)

#### Opción 1: Heroku Postgres (Gratuito)
```bash
# Si usas Heroku
heroku addons:create heroku-postgresql:hobby-dev
heroku config:get DATABASE_URL
```

#### Opción 2: Supabase (Gratuito)
1. Ir a https://supabase.com/
2. Crear proyecto nuevo
3. Obtener connection string de Settings > Database

#### Opción 3: ElephantSQL (Gratuito)
1. Ir a https://www.elephantsql.com/
2. Crear instancia gratuita
3. Obtener URL de conexión

## 🔧 Configuración de Gupshup

### Paso 1: Crear Cuenta en Gupshup

1. **Registrarse**:
   - Ir a https://www.gupshup.io/
   - Clic en "Sign Up" o "Get Started"
   - Completar formulario con datos reales
   - Verificar email

2. **Acceder al Dashboard**:
   - Iniciar sesión en https://www.gupshup.io/whatsapppanel/
   - Familiarizarse con la interfaz

### Paso 2: Configurar WhatsApp Business API

1. **Ir a WhatsApp API**:
   - En el dashboard, navegar a "WhatsApp API"
   - Clic en "Get Started"

2. **Configurar Número de Negocio**:
   - Ingresar tu número de WhatsApp Business
   - Verificar vía código SMS
   - Completar información del negocio

3. **Obtener API Key**:
   - Ir a "Settings" o "Configuración"
   - Encontrar sección "API Key" 
   - Copiar la API Key (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   - ⚠️ **IMPORTANTE**: Guardar esta clave de forma segura

### Paso 3: Configurar Webhooks en Gupshup

1. **Ir a Webhooks**:
   - En el dashboard, navegar a "Webhooks" o "Integration"
   - Clic en "Configure Webhook"

2. **Configurar URL del Webhook**:
   ```
   # Para desarrollo local con ngrok:
   https://xxxxx.ngrok.io/webhook/gupshup
   
   # Para producción:
   https://tu-dominio.com/webhook/gupshup
   ```

3. **Seleccionar Eventos**:
   - ✅ `message` (mensajes entrantes)
   - ✅ `message-event` (estados de entrega)
   - ✅ `user-event` (eventos de usuario)

4. **Configurar Token de Seguridad** (Opcional pero recomendado):
   ```bash
   # Generar token seguro:
   openssl rand -hex 32
   ```

### Paso 4: Configurar Bot de IA (Opcional pero Recomendado)

1. **Crear Bot**:
   - Ir a "Bot Builder" en el dashboard
   - Clic en "Create New Bot"
   - Nombre: "ReclamosLavanderiaBot"

2. **Configurar Intents Básicos**:

   **Intent: problema_monedas**
   ```
   Training Phrases:
   - "La máquina no acepta monedas"
   - "Problemas con monedas"
   - "No funciona el lector de monedas"
   
   Response:
   "¡Hola! Entiendo que tienes problemas con las monedas. 
   Intenta estos pasos:
   1. Verifica que las monedas estén limpias
   2. Inserta las monedas lentamente
   3. Si persiste, contacta al encargado
   
   ¿Esto resolvió tu problema?"
   ```

   **Intent: problema_lavado**
   ```
   Training Phrases:
   - "La ropa no queda limpia"
   - "Problemas con el lavado"
   - "El lavado no funciona bien"
   
   Response:
   "Lamento que tengas problemas con el lavado. 
   Verifiquemos:
   1. ¿Seleccionaste el programa correcto?
   2. ¿Usaste la cantidad adecuada de detergente?
   3. ¿La máquina estaba sobrecargada?
   
   Si el problema persiste, me conectarás con un agente."
   ```

   **Intent: escalamiento_humano**
   ```
   Training Phrases:
   - "Quiero hablar con una persona"
   - "No resuelve mi problema"
   - "Necesito ayuda humana"
   
   Response:
   "Entiendo, te conectaré con un agente humano. 
   En un momento alguien de nuestro equipo se comunicará contigo."
   
   Action: Transfer to human agent
   ```

## 🚀 Instalación del Proyecto

### Paso 1: Configurar Frontend

```bash
# Navegar al directorio del proyecto
cd GupshupReclamos

# Instalar dependencias
npm install

# Si hay errores de peer dependencies
npm install --legacy-peer-deps
```

### Paso 2: Configurar Backend

```bash
# Navegar al backend
cd backend

# Instalar dependencias del backend
npm install

# Crear archivo de configuración
touch .env  # En Windows: type nul > .env
```

### Paso 3: Configurar Variables de Entorno

Editar archivo `.env` en la carpeta `backend/`:

```bash
# ================================================================
# CONFIGURACIÓN GUPSHUP WHATSAPP BUSINESS API (OBLIGATORIO)
# ================================================================

# API Key de Gupshup
GUPSHUP_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
GUPSHUP_APP_NAME=ReclamosLavanderia

# Números de teléfono (sin + y sin espacios)
GUPSHUP_SOURCE_NUMBER=56958292939
GUPSHUP_TARGET_NUMBER=56958292939

# Bot ID (opcional - para IA avanzada)
GUPSHUP_BOT_ID=

# ================================================================
# CONFIGURACIÓN DEL SERVIDOR
# ================================================================

PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:19006

# ================================================================
# BASE DE DATOS POSTGRESQL (OBLIGATORIO PARA WEBHOOKS)
# ================================================================

# URL de conexión a PostgreSQL
# Local: postgresql://postgres:password@localhost:5432/gupshup_messages
# Heroku: postgres://user:pass@host:5432/dbname
DATABASE_URL=postgresql://localhost:5432/gupshup_messages

# ================================================================
# SEGURIDAD DE WEBHOOKS (RECOMENDADO)
# ================================================================

# Token secreto para validar webhooks
GUPSHUP_WEBHOOK_TOKEN=tu_token_secreto_muy_largo_aqui

# Secreto para firma HMAC (opcional)
GUPSHUP_WEBHOOK_SECRET=tu_secreto_hmac_aqui

# ================================================================
# CONFIGURACIÓN DE IA (OPCIONAL)
# ================================================================

# Habilitar respuestas automáticas
ENABLE_AUTO_RESPONSES=true
MAX_AUTO_RESPONSES_PER_DAY=10

# ================================================================
# SSL PARA PRODUCCIÓN (SOLO PRODUCCIÓN)
# ================================================================

SSL_PRIVATE_KEY=/path/to/private-key.pem
SSL_CERTIFICATE=/path/to/certificate.pem

# ================================================================
# NOTIFICACIONES (OPCIONAL)
# ================================================================

ADMIN_EMAIL=admin@lavanderia.com
NOTIFICATION_WEBHOOK_URL=
```

### 📝 Donde Obtener Cada Variable:

1. **GUPSHUP_API_KEY**: 
   - Dashboard Gupshup → Settings → API Key

2. **GUPSHUP_APP_NAME**:
   - Nombre de tu aplicación en Gupshup (ej: "ReclamosLavanderia")

3. **GUPSHUP_SOURCE_NUMBER**:
   - Tu número de WhatsApp Business registrado en Gupshup
   - Formato internacional sin +: 56912345678

4. **GUPSHUP_TARGET_NUMBER**:
   - Número donde quieres recibir los reclamos
   - Puede ser el mismo que SOURCE_NUMBER inicialmente

5. **DATABASE_URL**:
   - URL de conexión a PostgreSQL
   - Local: `postgresql://localhost:5432/gupshup_messages`
   - Remota: Obtener del proveedor de base de datos

6. **GUPSHUP_WEBHOOK_TOKEN**:
   - Generar con: `openssl rand -hex 32`
   - Usar el mismo token en Gupshup dashboard

## 🏃‍♂️ Ejecutar el Sistema

### Paso 1: Preparar Base de Datos

```bash
# Verificar conexión a PostgreSQL
psql postgresql://localhost:5432/gupshup_messages

# La aplicación creará las tablas automáticamente al iniciar
```

### Paso 2: Desarrollo Local con Ngrok (Para Webhooks)

```bash
# Terminal 1: Instalar y ejecutar ngrok
npm install -g ngrok
ngrok http 3000

# Copiar la URL HTTPS que ngrok proporciona
# Ejemplo: https://abc123.ngrok.io
```

### Paso 3: Configurar Webhook en Gupshup

```bash
# En Gupshup Dashboard > Webhooks, configurar:
URL: https://abc123.ngrok.io/webhook/gupshup
Events: message, message-event, user-event
Token: (el mismo GUPSHUP_WEBHOOK_TOKEN del .env)
```

### Paso 4: Ejecutar Aplicación

#### Opción 1: Desarrollo Separado

```bash
# Terminal 1: Iniciar Backend
cd backend
npm run dev

# Esperar a ver:
# 🚀 Servidor GupshupReclamos iniciado exitosamente
# 📡 Puerto: 3000
# 🔑 Gupshup configurado: true
# 💾 Base de datos: Conectada
# 🤖 IA automática: Activada

# Terminal 2: Iniciar Frontend
cd ..
npm start

# Esperar a ver:
# Starting Metro Bundler
# Expo DevTools: http://localhost:19002
```

#### Opción 2: Desarrollo Concurrente

```bash
# Desde la raíz del proyecto
npm run dev

# Esto iniciará ambos servicios automáticamente
```

### 🌐 Verificar que Todo Funciona

1. **Backend Health Check**:
   ```bash
   curl http://localhost:3000/health
   # Debe retornar: {"status":"ok", "features":{"webhooks":true, "database":true}}
   ```

2. **Gupshup Status Check**:
   ```bash
   curl http://localhost:3000/gupshup-status
   # Debe retornar: {"configured":true, "features":{"webhooks_enabled":true}}
   ```

3. **Base de Datos Check**:
   ```bash
   curl http://localhost:3000/admin/stats/messages
   # Debe retornar estadísticas (aunque estén vacías inicialmente)
   ```

4. **Frontend**:
   - Abrir http://localhost:19006
   - Debe mostrar la app de reclamos con colores azules de Gupshup

5. **Test de Webhook**:
   ```bash
   # Test manual del endpoint
   curl -X POST https://tu-ngrok-url.ngrok.io/webhook/gupshup \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer tu_webhook_token" \
     -d '{
       "app": "ReclamosLavanderia",
       "timestamp": 1640995200000,
       "version": 2,
       "type": "message",
       "payload": {
         "id": "test_message_123",
         "source": "56912345678",
         "type": "text",
         "payload": { "text": "Hola, testing webhook" },
         "sender": { "phone": "56912345678", "name": "Test User" }
       }
     }'
   ```

## 📱 Probar el Sistema Completo

### Test 1: Envío de Reclamo (Frontend → Gupshup)

1. **Llenar formulario**:
   - Nombre: "Juan Pérez Test"
   - Email: "test@email.com"
   - Teléfono: "+56912345678"
   - Problema: "Problemas con monedas"
   - Descripción: "La máquina 5 no acepta monedas de $100"

2. **Enviar reclamo**:
   - Presionar "🚀 Enviar Reclamo via Gupshup"
   - Verificar mensaje de éxito

3. **Verificar recepción**:
   - Revisar WhatsApp en el número configurado
   - Debe llegar mensaje formateado con los datos

### Test 2: Webhook y IA Conversacional (WhatsApp → Sistema)

1. **Enviar mensaje a tu WhatsApp Business**:
   ```
   "La máquina no acepta monedas"
   ```

2. **Verificar procesamiento automático**:
   - El sistema debe detectar el intent "problema_monedas"
   - Debe responder automáticamente con troubleshooting
   - El mensaje debe guardarse en la base de datos

3. **Verificar en logs del backend**:
   ```
   🤖 Procesando con IA: La máquina no acepta monedas
   🎯 Intent detectado localmente: problema_monedas Score: 2
   🤖 Respuesta automática enviada: gupshup_msg_xxxxx
   💾 Mensaje guardado en BD: 1
   ```

### Test 3: Escalamiento a Humano

1. **Enviar mensaje complejo**:
   ```
   "Quiero hablar con una persona"
   ```

2. **Verificar escalamiento**:
   - Debe detectar intent "escalamiento_humano"
   - Debe enviar mensaje de escalamiento
   - Debe notificar al equipo (ver logs)

### Test 4: Dashboard de Administración

1. **Ver estadísticas**:
   ```bash
   curl http://localhost:3000/admin/dashboard
   ```

2. **Ver conversación específica**:
   ```bash
   curl http://localhost:3000/admin/conversations/conv_56912345678
   ```

### Test 5: Fallback System

1. **Simular fallo de API**:
   - Temporalmente cambiar `GUPSHUP_API_KEY` a valor inválido
   - Reiniciar backend
   - Enviar reclamo desde la app

2. **Verificar fallback**:
   - Debe abrir WhatsApp Web automáticamente
   - El mensaje debe estar pre-escrito

## 📊 Monitoreo y Analytics

### Dashboard de Administración

Acceder a: `http://localhost:3000/admin/dashboard`

**Métricas disponibles**:
- Total de mensajes procesados
- Tasa de automatización (% resueltos por IA)
- Usuarios únicos
- Conversaciones activas
- Mensajes pendientes de procesar

### Logs Estructurados

El sistema genera logs detallados:

```bash
# Ver logs en tiempo real
cd backend
npm run dev

# Logs incluyen:
📨 Webhook entrante: {...}
🤖 Procesando con IA: mensaje
🎯 Intent detectado: problema_monedas
✅ Respuesta automática enviada
💾 Mensaje guardado en BD: ID
🚨 Notificación de escalamiento: {...}
```

### Base de Datos

Verificar datos almacenados:

```sql
-- Conectar a PostgreSQL
psql postgresql://localhost:5432/gupshup_messages

-- Ver mensajes recientes
SELECT * FROM messages ORDER BY timestamp DESC LIMIT 10;

-- Ver estadísticas
SELECT 
  message_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE processed = true) as processed,
  COUNT(*) FILTER (WHERE auto_response_sent = true) as auto_responded
FROM messages 
WHERE timestamp >= NOW() - INTERVAL '7 days'
GROUP BY message_type;
```

## 🚀 Despliegue en Producción

### Heroku Deploy (Backend)

```bash
# Crear app de Heroku
heroku create gupshup-reclamos-backend

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Configurar variables de entorno
heroku config:set GUPSHUP_API_KEY=tu_api_key
heroku config:set GUPSHUP_APP_NAME=ReclamosLavanderia
heroku config:set GUPSHUP_SOURCE_NUMBER=56958292939
heroku config:set GUPSHUP_TARGET_NUMBER=56958292939
heroku config:set NODE_ENV=production
heroku config:set ENABLE_AUTO_RESPONSES=true

# Generar y configurar webhook token
heroku config:set GUPSHUP_WEBHOOK_TOKEN=$(openssl rand -hex 32)

# Deploy
git push heroku main

# Configurar webhook en Gupshup
# URL: https://tu-app.herokuapp.com/webhook/gupshup
```

### Frontend (Expo)

```bash
# Build para producción
expo build:android
expo build:ios

# O publicar en Expo
expo publish
```

### Configurar Dominio y SSL

```bash
# Para producción, necesitas:
# 1. Dominio propio (ej: api.lavanderia.com)
# 2. Certificado SSL válido
# 3. Configurar webhook URL en Gupshup con HTTPS
```

## 🚨 Troubleshooting Avanzado

### Problema: Webhooks no llegan

```bash
# 1. Verificar ngrok está corriendo
curl https://tu-ngrok-url.ngrok.io/health

# 2. Verificar configuración en Gupshup
# Dashboard > Webhooks > Test Connection

# 3. Verificar logs del backend
npm run dev
# Buscar: 📨 Webhook entrante

# 4. Test manual del webhook
curl -X POST https://tu-ngrok-url.ngrok.io/webhook/gupshup \
  -H "Content-Type: application/json" \
  -d '{"app":"ReclamosLavanderia","timestamp":1640995200000,"type":"message","payload":{"id":"test","source":"56912345678","type":"text","payload":{"text":"test"}}}'
```

### Problema: Base de datos no conecta

```bash
# Verificar PostgreSQL está corriendo
pg_isready

# Verificar URL de conexión
psql $DATABASE_URL

# Verificar permisos
GRANT ALL PRIVILEGES ON DATABASE gupshup_messages TO tu_usuario;

# Verificar en logs del backend
# Buscar: ✅ Tabla messages y índices creados/verificados
```

### Problema: IA no responde automáticamente

```bash
# Verificar configuración
echo $ENABLE_AUTO_RESPONSES  # Debe ser 'true'

# Verificar API Key
curl -H "apikey: $GUPSHUP_API_KEY" https://api.gupshup.io/sm/api/v1/app

# Verificar logs de IA
# Buscar: 🎯 Intent detectado: problema_monedas
# Buscar: 🤖 Respuesta automática enviada
```

### Problema: "Gupshup API Key no configurada"

```bash
# Verificar archivo .env
cat backend/.env | grep GUPSHUP_API_KEY

# Verificar que la variable se carga
cd backend
node -e "require('dotenv').config(); console.log(process.env.GUPSHUP_API_KEY)"

# Verificar formato de la clave
# Debe ser: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## 🎯 Próximos Pasos Avanzados

### 1. Personalizar IA Conversacional

```bash
# Agregar más intents en backend/services/aiService.js
# Entrenar con conversaciones reales
# Implementar feedback loop para mejorar respuestas
```

### 2. Integrar con CRM Externo

```bash
# Modificar backend/controllers/webhookController.js
# Agregar webhook a sistema CRM en escalateToHuman()
# Sincronizar clientes con base de datos externa
```

### 3. Analytics Avanzados

```bash
# Implementar métricas de satisfacción
# Dashboard en tiempo real con WebSockets
# Reportes automáticos por email
```

### 4. Funciones Multi-canal

```bash
# Agregar SMS como fallback
# Integrar con Facebook Messenger
# Soporte para RCS (Rich Communication Services)
```

### 5. Automatización Avanzada

```bash
# Respuestas programadas por horario
# Derivación automática por tipo de cliente
# Integración con sistema de tickets
```

## 📞 Soporte Técnico

### 🔗 Enlaces Útiles
- **Gupshup Documentation**: https://docs.gupshup.io/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Webhook Testing**: https://webhook.site/
- **Ngrok Documentation**: https://ngrok.com/docs

### 🐛 Reportar Problemas

Si encuentras errores:

1. **Revisar logs** del backend y frontend
2. **Verificar configuración** de todas las variables de entorno
3. **Probar webhooks** manualmente con curl
4. **Consultar documentación** de Gupshup
5. **Contactar soporte** con logs específicos del error

### 💡 Solicitar Features

Para nuevas funcionalidades:
- Describir el caso de uso específico
- Explicar el beneficio esperado para el negocio
- Proporcionar ejemplos de implementación deseada

---

**¡Listo! Tu sistema GupshupReclamos con IA conversacional, webhooks bidireccionales y almacenamiento en base de datos está configurado y funcionando completamente.** 🎉

**Sistema completo incluye:**
- ✅ Envío de reclamos frontend → WhatsApp
- ✅ Recepción de mensajes WhatsApp → Base de datos  
- ✅ IA conversacional automática
- ✅ Escalamiento inteligente a humanos
- ✅ Dashboard de administración
- ✅ Analytics y monitoreo
- ✅ Seguridad y validación robusta 