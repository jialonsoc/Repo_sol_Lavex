const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// Importar controladores y middleware
const {
  processIncomingMessage,
  processMessageEvent,
  processUserEvent,
  getConversation,
  getMessageStats
} = require('./controllers/webhookController');

const {
  validateGupshupWebhook,
  verifyGupshupSignature,
  webhookRateLimit,
  logWebhookDetails,
  validateMessageStructure
} = require('./middleware/webhookValidation');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana por IP
  message: {
    error: 'Demasiadas solicitudes, intenta nuevamente en 15 minutos'
  }
});
app.use('/api/', generalLimiter);

// Middleware básico
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuración de multer para archivos
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Configuración de Gupshup
const GUPSHUP_CONFIG = {
  apiKey: process.env.GUPSHUP_API_KEY,
  appName: process.env.GUPSHUP_APP_NAME || 'ReclamosLavanderia',
  sourceNumber: process.env.GUPSHUP_SOURCE_NUMBER || '56958292939',
  targetNumber: process.env.GUPSHUP_TARGET_NUMBER || '56958292939',
  apiUrl: 'https://api.gupshup.io/sm/api/v1/msg'
};

// Validaciones para reclamos
const validateReclamoData = [
  body('formData.nombre').notEmpty().withMessage('Nombre es requerido'),
  body('formData.email').isEmail().withMessage('Email inválido'),
  body('formData.telefono').notEmpty().withMessage('Teléfono es requerido'),
  body('formData.tipoProblema').notEmpty().withMessage('Tipo de problema es requerido'),
  body('formData.descripcion').notEmpty().withMessage('Descripción es requerida'),
];

// Función para crear mensaje de reclamo
const createReclamoMessage = (formData, archivos) => {
  const TIPOS_PROBLEMAS = {
    monedas: 'Problemas con monedas',
    lavado: 'Problemas con el lavado',
    secado: 'Problemas con el secado',
    maquina: 'Máquina no funciona',
    dinero: 'Problemas con recargas',
    otro: 'Otro problema'
  };

  const problemaDescripcion = TIPOS_PROBLEMAS[formData.tipoProblema] || formData.tipoProblema;
  
  let mensaje = `🔧 *NUEVO RECLAMO - LAVANDERÍA*\n\n`;
  mensaje += `👤 *Cliente:* ${formData.nombre}\n`;
  mensaje += `📧 *Email:* ${formData.email}\n`;
  mensaje += `📱 *Teléfono:* ${formData.telefono}\n\n`;
  mensaje += `🔸 *Tipo de Problema:* ${problemaDescripcion}\n`;
  mensaje += `📝 *Descripción:* ${formData.descripcion}\n\n`;

  // Campos adicionales según el tipo de problema
  if (formData.numeroMaquina) {
    mensaje += `🏷️ *Número de Máquina:* ${formData.numeroMaquina}\n`;
  }
  
  if (formData.montoRecarga) {
    mensaje += `💰 *Monto de Recarga:* $${formData.montoRecarga}\n`;
  }
  
  if (formData.tipoLavado) {
    mensaje += `🧺 *Tipo de Lavado:* ${formData.tipoLavado}\n`;
  }

  // Información de archivos adjuntos
  const archivosAdjuntos = Object.keys(archivos || {});
  if (archivosAdjuntos.length > 0) {
    mensaje += `\n📎 *Archivos adjuntos:* ${archivosAdjuntos.length} archivo(s)\n`;
    archivosAdjuntos.forEach((key, index) => {
      mensaje += `   ${index + 1}. ${archivos[key].name}\n`;
    });
  }

  mensaje += `\n⏰ *Fecha:* ${new Date().toLocaleString('es-CL')}\n`;
  mensaje += `🤖 *Enviado vía:* Gupshup WhatsApp Business API`;

  return mensaje;
};

// Función para enviar mensaje vía Gupshup
const sendGupshupMessage = async (formData, archivos) => {
  try {
    if (!GUPSHUP_CONFIG.apiKey) {
      throw new Error('Gupshup API Key no configurada');
    }

    const mensaje = createReclamoMessage(formData, archivos);
    console.log('📤 Enviando mensaje vía Gupshup:', {
      source: GUPSHUP_CONFIG.sourceNumber,
      destination: GUPSHUP_CONFIG.targetNumber,
      appName: GUPSHUP_CONFIG.appName
    });

    // Preparar datos para Gupshup API
    const messageData = new URLSearchParams({
      channel: 'whatsapp',
      source: GUPSHUP_CONFIG.sourceNumber,
      destination: GUPSHUP_CONFIG.targetNumber,
      'src.name': GUPSHUP_CONFIG.appName,
      'destination.name': formData.nombre,
      message: JSON.stringify({
        type: 'text',
        text: mensaje
      })
    });

    const response = await axios.post(GUPSHUP_CONFIG.apiUrl, messageData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': GUPSHUP_CONFIG.apiKey
      },
      timeout: 10000
    });

    console.log('✅ Respuesta de Gupshup:', response.data);
    return {
      success: true,
      messageId: response.data.messageId || 'gupshup-success',
      response: response.data
    };

  } catch (error) {
    console.error('❌ Error enviando vía Gupshup:', error.response?.data || error.message);
    throw error;
  }
};

// =============================================================================
// RUTAS PRINCIPALES
// =============================================================================

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'GupshupReclamos Backend',
    version: '1.0.0',
    features: {
      webhooks: true,
      ai_responses: true,
      database: !!process.env.DATABASE_URL,
      gupshup_configured: !!GUPSHUP_CONFIG.apiKey
    }
  });
});

// Ruta para verificar configuración de Gupshup
app.get('/gupshup-status', (req, res) => {
  const isConfigured = !!(
    GUPSHUP_CONFIG.apiKey &&
    GUPSHUP_CONFIG.appName &&
    GUPSHUP_CONFIG.sourceNumber &&
    GUPSHUP_CONFIG.targetNumber
  );

  res.json({
    configured: isConfigured,
    appName: GUPSHUP_CONFIG.appName,
    sourceNumber: GUPSHUP_CONFIG.sourceNumber ? GUPSHUP_CONFIG.sourceNumber.replace(/\d{4}$/, '****') : null,
    targetNumber: GUPSHUP_CONFIG.targetNumber ? GUPSHUP_CONFIG.targetNumber.replace(/\d{4}$/, '****') : null,
    hasApiKey: !!GUPSHUP_CONFIG.apiKey,
    features: {
      webhooks_enabled: true,
      ai_responses: !!process.env.ENABLE_AUTO_RESPONSES !== 'false',
      database_connected: !!process.env.DATABASE_URL
    }
  });
});

// =============================================================================
// RUTAS DE WEBHOOK (CON MIDDLEWARE DE VALIDACIÓN)
// =============================================================================

// Webhook principal para mensajes entrantes
app.post('/webhook/gupshup', 
  webhookRateLimit,
  logWebhookDetails,
  validateGupshupWebhook,
  validateMessageStructure,
  processIncomingMessage
);

// Webhook para eventos de mensajes (entregado, leído, etc.)
app.post('/webhook/gupshup/events',
  webhookRateLimit,
  logWebhookDetails,
  validateGupshupWebhook,
  processMessageEvent
);

// Webhook para eventos de usuario (typing, online, etc.)
app.post('/webhook/gupshup/users',
  webhookRateLimit,
  logWebhookDetails,
  validateGupshupWebhook,
  processUserEvent
);

// =============================================================================
// RUTAS DE API PARA EL FRONTEND
// =============================================================================

// Ruta principal: Enviar reclamo vía Gupshup
app.post('/send-gupshup', validateReclamoData, async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Datos de validación incorrectos',
        details: errors.array()
      });
    }

    const { formData, archivos } = req.body;

    console.log('📥 Recibiendo reclamo:', {
      nombre: formData.nombre,
      tipoProblema: formData.tipoProblema,
      archivos: Object.keys(archivos || {}).length
    });

    // Enviar mensaje
    const result = await sendGupshupMessage(formData, archivos);

    res.json({
      success: true,
      message: 'Reclamo enviado exitosamente vía Gupshup',
      messageId: result.messageId,
      timestamp: new Date().toISOString(),
      data: result.response
    });

  } catch (error) {
    console.error('❌ Error en /send-gupshup:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// =============================================================================
// RUTAS DE ADMINISTRACIÓN Y MONITOREO
// =============================================================================

// Obtener conversación específica
app.get('/admin/conversations/:conversationId', getConversation);

// Obtener estadísticas de mensajes
app.get('/admin/stats/messages', getMessageStats);

// Obtener resumen de actividad
app.get('/admin/dashboard', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    // Combinar estadísticas para dashboard
    const stats = await require('./models/Message').getStats(parseInt(days));
    const unprocessed = await require('./models/Message').getUnprocessed(10);
    
    // Calcular métricas agregadas
    const totals = stats.reduce((acc, day) => {
      acc.total_messages += parseInt(day.total_messages) || 0;
      acc.auto_responses += parseInt(day.auto_responses) || 0;
      acc.unique_users = Math.max(acc.unique_users, parseInt(day.unique_users) || 0);
      return acc;
    }, { total_messages: 0, auto_responses: 0, unique_users: 0 });

    const automationRate = totals.total_messages > 0 
      ? ((totals.auto_responses / totals.total_messages) * 100).toFixed(1)
      : 0;

    res.json({
      period_days: parseInt(days),
      summary: {
        total_messages: totals.total_messages,
        auto_responses: totals.auto_responses,
        automation_rate: `${automationRate}%`,
        unique_users: totals.unique_users,
        pending_messages: unprocessed.length
      },
      daily_stats: stats,
      recent_unprocessed: unprocessed.slice(0, 5)
    });

  } catch (error) {
    console.error('❌ Error en dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// RUTAS DE UTILIDAD
// =============================================================================

// Ruta para subir archivos
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo' });
    }

    // Aquí podrías subir el archivo a un servicio de almacenamiento
    // Por ahora solo devolvemos información del archivo
    res.json({
      success: true,
      file: {
        name: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('❌ Error subiendo archivo:', error.message);
    res.status(500).json({ error: 'Error subiendo archivo' });
  }
});

// Test endpoint para webhooks (desarrollo)
app.post('/test/webhook', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Endpoint no disponible en producción' });
  }

  console.log('🧪 Test webhook recibido:', req.body);
  res.json({
    received: true,
    timestamp: new Date().toISOString(),
    body: req.body
  });
});

// =============================================================================
// MANEJO DE ERRORES Y 404
// =============================================================================

// Manejo de errores de multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Archivo demasiado grande',
        maxSize: '5MB'
      });
    }
  }
  
  console.error('❌ Error no manejado:', error.message);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo salió mal'
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
    available_endpoints: {
      health: 'GET /health',
      webhook: 'POST /webhook/gupshup',
      send_complaint: 'POST /send-gupshup',
      admin_stats: 'GET /admin/stats/messages',
      admin_dashboard: 'GET /admin/dashboard'
    }
  });
});

// =============================================================================
// INICIALIZACIÓN DEL SERVIDOR
// =============================================================================

// Verificar configuración al inicio
const checkConfiguration = () => {
  const warnings = [];
  const errors = [];

  if (!GUPSHUP_CONFIG.apiKey) {
    errors.push('GUPSHUP_API_KEY no configurada');
  }

  if (!process.env.DATABASE_URL) {
    warnings.push('DATABASE_URL no configurada - funciones de webhook limitadas');
  }

  if (!process.env.GUPSHUP_WEBHOOK_TOKEN) {
    warnings.push('GUPSHUP_WEBHOOK_TOKEN no configurada - validación de webhook reducida');
  }

  if (errors.length > 0) {
    console.error('❌ ERRORES DE CONFIGURACIÓN:');
    errors.forEach(error => console.error(`   • ${error}`));
  }

  if (warnings.length > 0) {
    console.warn('⚠️ ADVERTENCIAS DE CONFIGURACIÓN:');
    warnings.forEach(warning => console.warn(`   • ${warning}`));
  }

  return { errors, warnings };
};

// Iniciar servidor
app.listen(PORT, () => {
  const config = checkConfiguration();
  
  console.log(`
🚀 Servidor GupshupReclamos iniciado exitosamente
=====================================
📡 Puerto: ${PORT}
🌐 Ambiente: ${process.env.NODE_ENV || 'development'}
🔑 Gupshup configurado: ${!!GUPSHUP_CONFIG.apiKey}
📱 App: ${GUPSHUP_CONFIG.appName}
💾 Base de datos: ${!!process.env.DATABASE_URL ? 'Conectada' : 'No configurada'}
🤖 IA automática: ${process.env.ENABLE_AUTO_RESPONSES !== 'false' ? 'Activada' : 'Desactivada'}
⏰ Fecha: ${new Date().toLocaleString('es-CL')}

🔗 Endpoints principales:
   • GET  /health
   • POST /webhook/gupshup  
   • POST /send-gupshup
   • GET  /admin/dashboard
   • GET  /gupshup-status

${config.errors.length === 0 ? '✅ Servidor listo para producción' : '⚠️ Revisar errores de configuración'}
=====================================
  `);
  
  if (config.errors.length > 0) {
    console.log('\n🛠️ Para configurar correctamente, revisar INSTRUCCIONES.md\n');
  }
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Señal SIGTERM recibida, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Señal SIGINT recibida, cerrando servidor...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

module.exports = app; 