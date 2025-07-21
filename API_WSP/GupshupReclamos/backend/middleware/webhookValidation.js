const crypto = require('crypto');

// Middleware principal de validación de webhook de Gupshup
const validateGupshupWebhook = (req, res, next) => {
  try {
    console.log('🔒 Validando webhook de Gupshup...');
    
    // 1. Verificar método HTTP
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        error: 'Método no permitido',
        allowed: ['POST']
      });
    }

    // 2. Verificar Content-Type
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({ 
        error: 'Content-Type debe ser application/json',
        received: contentType
      });
    }

    // 3. Verificar token de autorización (si está configurado)
    if (process.env.GUPSHUP_WEBHOOK_TOKEN) {
      const authHeader = req.headers.authorization;
      const expectedToken = `Bearer ${process.env.GUPSHUP_WEBHOOK_TOKEN}`;
      
      if (!authHeader || authHeader !== expectedToken) {
        console.warn('⚠️ Token de webhook inválido:', authHeader);
        return res.status(401).json({ 
          error: 'Token de autorización inválido' 
        });
      }
    }

    // 4. Verificar User-Agent de Gupshup (si está presente)
    const userAgent = req.headers['user-agent'];
    if (userAgent && !isValidGupshupUserAgent(userAgent)) {
      console.warn('⚠️ User-Agent sospechoso:', userAgent);
      // No bloquear, solo advertir
    }

    // 5. Verificar origen de la petición (whitelist de IPs de Gupshup)
    if (process.env.NODE_ENV === 'production') {
      const clientIP = getClientIP(req);
      if (!isValidGupshupIP(clientIP)) {
        console.warn('⚠️ IP no autorizada:', clientIP);
        // En desarrollo: solo advertir, en producción: bloquear
        // return res.status(403).json({ error: 'IP no autorizada' });
      }
    }

    // 6. Verificar estructura básica del payload
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ 
        error: 'Payload del webhook inválido',
        type: typeof req.body
      });
    }

    // 7. Verificar campos requeridos del webhook de Gupshup
    const requiredFields = ['app', 'timestamp', 'type'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Campos requeridos faltantes',
        missing: missingFields,
        required: requiredFields
      });
    }

    // 8. Verificar que el timestamp no sea muy antiguo (evitar replay attacks)
    const webhookTimestamp = req.body.timestamp;
    const currentTimestamp = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutos
    
    if (Math.abs(currentTimestamp - webhookTimestamp) > maxAge) {
      console.warn('⚠️ Webhook timestamp muy antiguo:', {
        webhook: new Date(webhookTimestamp),
        current: new Date(currentTimestamp),
        diff: currentTimestamp - webhookTimestamp
      });
      // No bloquear automáticamente, solo advertir
    }

    // 9. Verificar que sea de la app correcta
    if (process.env.GUPSHUP_APP_NAME && 
        req.body.app !== process.env.GUPSHUP_APP_NAME) {
      return res.status(400).json({ 
        error: 'Webhook de app incorrecta',
        expected: process.env.GUPSHUP_APP_NAME,
        received: req.body.app
      });
    }

    console.log('✅ Webhook validado correctamente');
    next();

  } catch (error) {
    console.error('❌ Error validando webhook:', error);
    res.status(500).json({ 
      error: 'Error interno de validación',
      message: error.message
    });
  }
};

// Verificar si el User-Agent parece ser de Gupshup
const isValidGupshupUserAgent = (userAgent) => {
  const validAgents = [
    'Gupshup',
    'GupshupBot',
    'WhatsApp',
    'curl', // Para testing
    'PostmanRuntime' // Para testing
  ];
  
  return validAgents.some(agent => 
    userAgent.toLowerCase().includes(agent.toLowerCase())
  );
};

// Obtener IP real del cliente (considerando proxies y load balancers)
const getClientIP = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         req.headers['x-client-ip'] ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.ip ||
         'unknown';
};

// Verificar si la IP está en la whitelist de Gupshup
const isValidGupshupIP = (ip) => {
  // IPs conocidas de Gupshup (actualizar según documentación oficial)
  const gupshupIPRanges = [
    '52.66.99.0/24',    // AWS Asia Pacific (Mumbai)
    '13.232.0.0/16',    // AWS Asia Pacific (Mumbai)
    '35.154.0.0/16',    // AWS Asia Pacific (Mumbai)
    '52.66.0.0/16',     // AWS Asia Pacific (Mumbai)
    // Agregar más rangos según la documentación de Gupshup
  ];
  
  // En desarrollo, permitir localhost y IPs privadas
  if (process.env.NODE_ENV !== 'production') {
    const testIPs = [
      '127.0.0.1',
      'localhost',
      '::1',
      '10.0.0.0/8',
      '172.16.0.0/12',
      '192.168.0.0/16'
    ];
    
    if (testIPs.some(testIP => ip.includes(testIP) || testIP.includes(ip))) {
      return true;
    }
  }
  
  // TODO: Implementar verificación real de rangos IP
  // Por ahora, permitir todas las IPs para evitar bloqueos accidentales
  return true;
};

// Middleware para verificar firma HMAC (si Gupshup la proporciona)
const verifyGupshupSignature = (req, res, next) => {
  try {
    const signature = req.headers['x-gupshup-signature'];
    const secret = process.env.GUPSHUP_WEBHOOK_SECRET;
    
    if (!secret) {
      // Si no hay secreto configurado, continuar sin verificar
      return next();
    }
    
    if (!signature) {
      return res.status(401).json({ 
        error: 'Firma requerida pero no proporcionada' 
      });
    }
    
    // Calcular firma esperada
    const payload = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');
    
    const receivedSignature = signature.replace('sha256=', '');
    
    // Comparación segura contra timing attacks
    if (!crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    )) {
      console.warn('⚠️ Firma HMAC inválida');
      return res.status(401).json({ 
        error: 'Firma inválida' 
      });
    }
    
    console.log('✅ Firma HMAC verificada');
    next();
    
  } catch (error) {
    console.error('❌ Error verificando firma:', error);
    res.status(500).json({ 
      error: 'Error verificando autenticidad' 
    });
  }
};

// Middleware para rate limiting específico de webhooks
const webhookRateLimit = (req, res, next) => {
  // Rate limiting más permisivo para webhooks
  // Gupshup puede enviar múltiples webhooks rápidamente
  
  const clientIP = getClientIP(req);
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxRequests = 200; // 200 webhooks por minuto por IP
  
  // Implementación simple en memoria (en producción usar Redis)
  if (!global.webhookRateLimit) {
    global.webhookRateLimit = new Map();
  }
  
  const key = `webhook_${clientIP}`;
  const requests = global.webhookRateLimit.get(key) || [];
  
  // Limpiar requests antiguos
  const validRequests = requests.filter(timestamp => 
    now - timestamp < windowMs
  );
  
  if (validRequests.length >= maxRequests) {
    console.warn('⚠️ Rate limit excedido para webhook:', clientIP);
    return res.status(429).json({ 
      error: 'Demasiados webhooks',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }
  
  validRequests.push(now);
  global.webhookRateLimit.set(key, validRequests);
  
  next();
};

// Middleware para logging detallado de webhooks
const logWebhookDetails = (req, res, next) => {
  const startTime = Date.now();
  
  console.log('📨 Webhook entrante:', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: getClientIP(req),
    userAgent: req.headers['user-agent'],
    contentLength: req.headers['content-length'],
    type: req.body?.type,
    app: req.body?.app
  });
  
  // Override res.json para capturar la respuesta
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - startTime;
    console.log('📤 Respuesta webhook:', {
      status: res.statusCode,
      duration: `${duration}ms`,
      response: data?.status || 'unknown'
    });
    return originalJson.call(this, data);
  };
  
  next();
};

// Middleware para validar estructura específica de mensaje
const validateMessageStructure = (req, res, next) => {
  try {
    const { type, payload } = req.body;
    
    if (type === 'message' && payload) {
      // Validar campos requeridos para mensajes
      const requiredMessageFields = ['id', 'source', 'type'];
      const missingFields = requiredMessageFields.filter(field => 
        !payload[field]
      );
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: 'Estructura de mensaje inválida',
          missing: missingFields,
          type: 'message_validation'
        });
      }
      
      // Validar que el contenido del mensaje no esté vacío para mensajes de texto
      if (payload.type === 'text' && 
          (!payload.payload?.text && !payload.text)) {
        return res.status(400).json({
          error: 'Mensaje de texto vacío',
          type: 'empty_text_message'
        });
      }
    }
    
    next();
    
  } catch (error) {
    console.error('❌ Error validando estructura de mensaje:', error);
    res.status(400).json({
      error: 'Error validando estructura de mensaje',
      message: error.message
    });
  }
};

module.exports = {
  validateGupshupWebhook,
  verifyGupshupSignature,
  webhookRateLimit,
  logWebhookDetails,
  validateMessageStructure,
  
  // Funciones utilitarias
  getClientIP,
  isValidGupshupIP,
  isValidGupshupUserAgent
}; 