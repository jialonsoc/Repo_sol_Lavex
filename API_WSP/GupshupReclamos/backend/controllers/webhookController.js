const Message = require('../models/Message');
const { 
  detectIntent, 
  generateResponse, 
  sendAutomaticResponse,
  escalateToHuman 
} = require('../services/aiService');

// Extractor de datos del webhook de Gupshup
const extractMessageData = (webhookPayload) => {
  const { payload, timestamp, app, version, type } = webhookPayload;
  
  if (!payload) {
    throw new Error('Payload del webhook inválido');
  }

  return {
    // DATOS ESENCIALES
    messageId: payload.id,
    fromNumber: payload.source || payload.sender?.phone,
    toNumber: process.env.GUPSHUP_SOURCE_NUMBER,
    messageType: payload.type || 'text',
    
    // CONTENIDO DEL MENSAJE
    content: payload.payload?.text || payload.text || '',
    mediaUrl: payload.payload?.url || payload.url || null,
    caption: payload.payload?.caption || payload.caption || '',
    
    // METADATA DEL REMITENTE
    senderName: payload.sender?.name || payload.name || 'Usuario',
    senderPhone: payload.sender?.phone || payload.source,
    countryCode: payload.sender?.country_code || '56',
    
    // CONTEXTO DE CONVERSACIÓN
    conversationId: payload.context?.id || `conv_${payload.source}`,
    gupshupSessionId: payload.context?.gsId || payload.gsId,
    
    // DATOS TEMPORALES
    timestamp: new Date(timestamp),
    receivedAt: new Date(),
    
    // METADATA ADICIONAL
    metadata: {
      app,
      version,
      webhookType: type,
      rawPayload: payload
    }
  };
};

// Verificar si es un mensaje duplicado
const isDuplicateMessage = async (messageId) => {
  try {
    return await Message.exists(messageId);
  } catch (error) {
    console.error('❌ Error verificando duplicado:', error);
    return false;
  }
};

// Procesador principal de webhooks
const processIncomingMessage = async (req, res) => {
  try {
    console.log('📨 Webhook recibido de Gupshup:', {
      type: req.body.type,
      timestamp: new Date().toISOString(),
      headers: req.headers
    });

    // Validar estructura básica del webhook
    if (!req.body || !req.body.payload) {
      return res.status(400).json({
        error: 'Estructura de webhook inválida',
        required: ['payload']
      });
    }

    // Extraer datos del mensaje
    const messageData = extractMessageData(req.body);
    console.log('📋 Datos extraídos:', {
      messageId: messageData.messageId,
      from: messageData.fromNumber,
      type: messageData.messageType,
      content: messageData.content?.substring(0, 50) + '...'
    });

    // Verificar si es un mensaje duplicado
    if (await isDuplicateMessage(messageData.messageId)) {
      console.log('🔄 Mensaje duplicado detectado:', messageData.messageId);
      return res.status(200).json({ 
        status: 'duplicate',
        message: 'Mensaje ya procesado',
        messageId: messageData.messageId
      });
    }

    // Guardar mensaje en base de datos
    const savedMessage = await Message.save(messageData);
    console.log('💾 Mensaje guardado en BD:', savedMessage.id);

    // Procesar solo mensajes de texto con IA
    if (messageData.messageType === 'text' && messageData.content.trim()) {
      await processMessageWithAI(messageData);
    } else if (messageData.messageType === 'image') {
      await processImageMessage(messageData);
    }

    // Marcar mensaje como procesado
    await Message.markAsProcessed(messageData.messageId);

    // Respuesta exitosa a Gupshup (SIEMPRE status 200)
    res.status(200).json({
      status: 'received',
      messageId: messageData.messageId,
      timestamp: new Date().toISOString(),
      processed: true
    });

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    
    // IMPORTANTE: Responder con status 200 para evitar reenvíos de Gupshup
    res.status(200).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Procesar mensaje de texto con IA
const processMessageWithAI = async (messageData) => {
  try {
    const { content, fromNumber, conversationId, messageId } = messageData;
    
    console.log('🤖 Procesando con IA:', content);

    // Obtener historial de conversación para contexto
    const conversation = await Message.getConversation(conversationId, 10);
    
    // Detectar intención del mensaje
    const intent = await detectIntent(content, conversation);
    console.log('🎯 Intent detectado:', intent);

    // Verificar si debe escalarse a humano
    if (intent === 'escalamiento_humano' || content.toLowerCase().includes('agente')) {
      await escalateToHuman(fromNumber, conversationId, messageData);
      await Message.markAutoResponseSent(messageId);
      return;
    }

    // Generar respuesta automática basada en el intent
    const response = await generateResponse(intent, content, conversation);
    
    if (response && response.trim()) {
      // Enviar respuesta automática
      const sent = await sendAutomaticResponse(fromNumber, response);
      
      if (sent) {
        await Message.markAutoResponseSent(messageId);
        console.log('✅ Respuesta automática enviada');
      }
    }

  } catch (error) {
    console.error('❌ Error en procesamiento IA:', error);
  }
};

// Procesar mensaje de imagen
const processImageMessage = async (messageData) => {
  try {
    console.log('📸 Procesando imagen:', messageData.mediaUrl);
    
    // Respuesta automática para imágenes
    const response = `Gracias por enviar la imagen. 📸
    
Nuestro equipo la revisará y se pondrá en contacto contigo pronto.

Si es urgente, escribe "agente" para conectarte inmediatamente con una persona.`;

    await sendAutomaticResponse(messageData.fromNumber, response);
    await Message.markAutoResponseSent(messageData.messageId);
    
  } catch (error) {
    console.error('❌ Error procesando imagen:', error);
  }
};

// Webhook para eventos de estado de mensajes
const processMessageEvent = async (req, res) => {
  try {
    console.log('📊 Evento de mensaje recibido:', req.body);
    
    // Aquí puedes procesar eventos como:
    // - sent: mensaje enviado
    // - delivered: mensaje entregado
    // - read: mensaje leído
    // - failed: mensaje falló
    
    const { payload } = req.body;
    if (payload && payload.type) {
      console.log(`📈 Estado del mensaje ${payload.id}: ${payload.type}`);
      
      // Actualizar estado en base de datos si es necesario
      // await updateMessageStatus(payload.id, payload.type);
    }

    res.status(200).json({
      status: 'event_received',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error procesando evento:', error);
    res.status(200).json({
      status: 'error',
      error: error.message
    });
  }
};

// Webhook para eventos de usuario
const processUserEvent = async (req, res) => {
  try {
    console.log('👤 Evento de usuario recibido:', req.body);
    
    // Eventos como: user_joined, user_left, typing, etc.
    
    res.status(200).json({
      status: 'user_event_received',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error procesando evento de usuario:', error);
    res.status(200).json({
      status: 'error',
      error: error.message
    });
  }
};

// Endpoint para obtener conversación (para dashboard admin)
const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50 } = req.query;
    
    const messages = await Message.getConversation(conversationId, parseInt(limit));
    
    res.json({
      conversationId,
      messages,
      count: messages.length
    });

  } catch (error) {
    console.error('❌ Error obteniendo conversación:', error);
    res.status(500).json({ error: error.message });
  }
};

// Endpoint para obtener estadísticas
const getMessageStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const stats = await Message.getStats(parseInt(days));
    
    // Calcular totales
    const totals = stats.reduce((acc, day) => {
      acc.total_messages += parseInt(day.total_messages) || 0;
      acc.text_messages += parseInt(day.text_messages) || 0;
      acc.image_messages += parseInt(day.image_messages) || 0;
      acc.processed_messages += parseInt(day.processed_messages) || 0;
      acc.auto_responses += parseInt(day.auto_responses) || 0;
      acc.unique_users = Math.max(acc.unique_users, parseInt(day.unique_users) || 0);
      acc.unique_conversations = Math.max(acc.unique_conversations, parseInt(day.unique_conversations) || 0);
      return acc;
    }, {
      total_messages: 0,
      text_messages: 0,
      image_messages: 0,
      processed_messages: 0,
      auto_responses: 0,
      unique_users: 0,
      unique_conversations: 0
    });

    res.json({
      period_days: parseInt(days),
      totals,
      daily_stats: stats
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  processIncomingMessage,
  processMessageEvent,
  processUserEvent,
  getConversation,
  getMessageStats,
  extractMessageData
}; 