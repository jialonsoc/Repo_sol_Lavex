const axios = require('axios');

// Mapeo de palabras clave a intents
const INTENT_KEYWORDS = {
  problema_monedas: [
    'moneda', 'monedas', 'no acepta', 'rechaza', 'devuelve', 'dinero',
    'pago', 'pagos', 'lector', 'efectivo', '$100', '$500', 'peso', 'pesos'
  ],
  problema_lavado: [
    'lavado', 'lavar', 'ropa', 'limpia', 'limpio', 'detergente', 'jabón',
    'programa', 'ciclo', 'mancha', 'manchas', 'sucia', 'sucio'
  ],
  problema_secado: [
    'secado', 'secar', 'seca', 'humeda', 'húmeda', 'mojada', 'mojado',
    'centrifugado', 'centrifuga', 'temperatura', 'calor'
  ],
  problema_maquina: [
    'máquina', 'maquina', 'no funciona', 'rota', 'roto', 'descompuesta',
    'error', 'falla', 'traba', 'trabada', 'pantalla', 'display'
  ],
  escalamiento_humano: [
    'agente', 'persona', 'humano', 'operador', 'ayuda', 'hablar',
    'contactar', 'urgente', 'reclamo', 'queja', 'molesto', 'enojado'
  ],
  horarios_ubicacion: [
    'horario', 'horarios', 'abierto', 'cerrado', 'ubicación', 'dirección',
    'donde', 'dónde', 'cuándo', 'cuando', 'hora', 'tiempo'
  ],
  consulta_precios: [
    'precio', 'precios', 'costo', 'cuesta', 'tarifa', 'valor',
    'cuánto', 'cuanto', 'promoción', 'descuento', 'oferta'
  ]
};

// Detectar intención del mensaje usando palabras clave y contexto
const detectIntent = async (message, conversation = []) => {
  try {
    const messageText = message.toLowerCase().trim();
    
    // Primero intentar con la API de Gupshup (si está configurada)
    const gupshupIntent = await detectIntentWithGupshup(message);
    if (gupshupIntent && gupshupIntent !== 'unknown') {
      return gupshupIntent;
    }
    
    // Fallback: detección local basada en palabras clave
    const scores = {};
    
    // Calcular puntuación para cada intent
    Object.entries(INTENT_KEYWORDS).forEach(([intent, keywords]) => {
      scores[intent] = 0;
      
      keywords.forEach(keyword => {
        if (messageText.includes(keyword)) {
          scores[intent] += 1;
          
          // Puntuación extra si la palabra está al inicio
          if (messageText.startsWith(keyword)) {
            scores[intent] += 0.5;
          }
        }
      });
    });
    
    // Considerar contexto de conversación
    if (conversation.length > 0) {
      const lastMessages = conversation.slice(-3);
      const contextText = lastMessages.map(msg => msg.content).join(' ').toLowerCase();
      
      Object.entries(INTENT_KEYWORDS).forEach(([intent, keywords]) => {
        keywords.forEach(keyword => {
          if (contextText.includes(keyword)) {
            scores[intent] += 0.3; // Puntuación menor por contexto
          }
        });
      });
    }
    
    // Encontrar el intent con mayor puntuación
    const maxScore = Math.max(...Object.values(scores));
    
    if (maxScore === 0) {
      return 'consulta_general';
    }
    
    const detectedIntent = Object.keys(scores).find(intent => scores[intent] === maxScore);
    
    console.log('🎯 Intent detectado localmente:', detectedIntent, 'Score:', maxScore);
    return detectedIntent;
    
  } catch (error) {
    console.error('❌ Error detectando intent:', error);
    return 'consulta_general';
  }
};

// Detectar intent usando la API de Gupshup (requiere bot configurado)
const detectIntentWithGupshup = async (message) => {
  try {
    if (!process.env.GUPSHUP_BOT_ID || !process.env.GUPSHUP_API_KEY) {
      return null; // No hay bot configurado
    }
    
    const response = await axios.post('https://api.gupshup.io/sm/api/v1/bot/query', {
      query: message,
      sessionId: `intent_detection_${Date.now()}`,
      botId: process.env.GUPSHUP_BOT_ID
    }, {
      headers: {
        'apikey': process.env.GUPSHUP_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    return response.data?.intent || null;
    
  } catch (error) {
    // Silenciar errores de la API de Gupshup (fallback funciona)
    return null;
  }
};

// Generar respuesta automática basada en el intent
const generateResponse = async (intent, originalMessage, conversation = []) => {
  try {
    const senderName = conversation.length > 0 ? conversation[0].sender_name : '';
    const greeting = senderName ? `Hola ${senderName}! ` : 'Hola! ';
    
    switch (intent) {
      case 'problema_monedas':
        return await generateCoinProblemResponse(originalMessage, greeting);
        
      case 'problema_lavado':
        return await generateWashProblemResponse(originalMessage, greeting);
        
      case 'problema_secado':
        return await generateDryProblemResponse(originalMessage, greeting);
        
      case 'problema_maquina':
        return await generateMachineProblemResponse(originalMessage, greeting);
        
      case 'horarios_ubicacion':
        return await generateLocationInfoResponse(greeting);
        
      case 'consulta_precios':
        return await generatePricingResponse(greeting);
        
      case 'escalamiento_humano':
        return null; // Manejado directamente en el controlador
        
      default:
        return await generateGenericResponse(originalMessage, greeting);
    }
    
  } catch (error) {
    console.error('❌ Error generando respuesta:', error);
    return 'Disculpa, hubo un problema técnico. Un agente se contactará contigo pronto.';
  }
};

// Respuestas específicas por tipo de problema

const generateCoinProblemResponse = async (message, greeting) => {
  return `${greeting}Entiendo que tienes problemas con las monedas. 🪙

Intenta estos pasos:
1️⃣ Verifica que las monedas estén limpias y sin daños
2️⃣ Inserta las monedas lentamente una por una
3️⃣ Verifica que uses monedas válidas ($100, $500)
4️⃣ Si la ranura está obstruida, no fuerces las monedas

✅ **Tip**: Las monedas muy nuevas o muy viejas a veces no son reconocidas.

Si el problema persiste, escribe "agente" para conectarte con una persona.

¿Esto resolvió tu problema? 🤔`;
};

const generateWashProblemResponse = async (message, greeting) => {
  return `${greeting}Lamento que tengas problemas con el lavado. 🧺

Verifiquemos algunas cosas:
1️⃣ ¿Seleccionaste el programa correcto para tu tipo de ropa?
2️⃣ ¿Usaste la cantidad adecuada de detergente?
3️⃣ ¿La máquina estaba sobrecargada de ropa?
4️⃣ ¿El agua salía limpia al final del ciclo?

✅ **Recomendación**: Máximo 8kg de ropa por lavado.

Si necesitas ayuda personalizada, escribe "agente" para hablar con nuestro equipo.

¿Te ayudó esta información? 👍`;
};

const generateDryProblemResponse = async (message, greeting) => {
  return `${greeting}Veo que tienes problemas con el secado. 🌪️

Revisa estos puntos:
1️⃣ ¿Seleccionaste la temperatura correcta?
2️⃣ ¿La ropa estaba muy húmeda al inicio?
3️⃣ ¿La máquina completó todo el ciclo?
4️⃣ ¿El filtro de pelusas está limpio?

✅ **Consejo**: Para mejor secado, no sobrecargues la máquina.

Si el problema continúa, escribe "agente" para asistencia directa.

¿Esto te sirvió? 🔥`;
};

const generateMachineProblemResponse = async (message, greeting) => {
  return `${greeting}¡Oh no! Parece que la máquina tiene un problema técnico. 🔧

Primeros pasos:
1️⃣ Verifica que la puerta esté bien cerrada
2️⃣ Revisa si hay algún mensaje de error en pantalla
3️⃣ Intenta reiniciar presionando el botón de encendido
4️⃣ Si hay ropa dentro, NO fuerces la puerta

⚠️ **Importante**: Si la máquina tiene ropa y no abre, NO te vayas.

Voy a conectarte con un técnico inmediatamente para resolver esto.

Escribe "técnico" o espera un momento... 🛠️`;
};

const generateLocationInfoResponse = async (greeting) => {
  return `${greeting}Aquí tienes la información que necesitas: 📍

📍 **Ubicación**: 
[Agregar dirección de la lavandería]

🕐 **Horarios**:
• Lunes a Viernes: 7:00 AM - 10:00 PM
• Sábados: 8:00 AM - 8:00 PM  
• Domingos: 9:00 AM - 6:00 PM

📞 **Contacto**: +56 9 5829 2939

🅿️ **Estacionamiento**: Disponible en la calle

¿Necesitas direcciones específicas? Escribe "ubicación" 🗺️`;
};

const generatePricingResponse = async (greeting) => {
  return `${greeting}Te comparto nuestros precios actuales: 💰

🧺 **Lavado**:
• Carga pequeña (5kg): $2.500
• Carga mediana (8kg): $3.500  
• Carga grande (12kg): $4.500

🌪️ **Secado**:
• 30 minutos: $1.500
• 45 minutos: $2.000
• 60 minutos: $2.500

💸 **Paquetes**:
• Lavado + Secado pequeño: $3.500
• Lavado + Secado mediano: $5.000

💳 **Formas de pago**: Efectivo (monedas) y tarjeta

¿Te interesa algún paquete específico? 📦`;
};

const generateGenericResponse = async (message, greeting) => {
  return `${greeting}Gracias por contactarnos. 😊

He recibido tu mensaje y nuestro equipo lo revisará pronto.

**Respuestas rápidas**:
• Escribe "monedas" para problemas de pago
• Escribe "lavado" para problemas de limpieza  
• Escribe "horarios" para información de horarios
• Escribe "precios" para ver tarifas
• Escribe "agente" para hablar con una persona

¿En qué más puedo ayudarte? 🤝`;
};

// Enviar respuesta automática vía Gupshup
const sendAutomaticResponse = async (toNumber, message) => {
  try {
    if (!process.env.GUPSHUP_API_KEY) {
      console.log('⚠️ GUPSHUP_API_KEY no configurada - respuesta no enviada');
      return false;
    }

    // Limpiar número de destino
    const cleanNumber = toNumber.replace(/^\+/, '');
    
    const messageData = new URLSearchParams({
      channel: 'whatsapp',
      source: process.env.GUPSHUP_SOURCE_NUMBER,
      destination: cleanNumber,
      'src.name': process.env.GUPSHUP_APP_NAME || 'LavanderiaBot',
      'destination.name': 'Cliente',
      message: JSON.stringify({
        type: 'text',
        text: message
      })
    });

    const response = await axios.post(
      'https://api.gupshup.io/sm/api/v1/msg',
      messageData,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'apikey': process.env.GUPSHUP_API_KEY
        },
        timeout: 10000
      }
    );
    
    console.log('🤖 Respuesta automática enviada:', {
      messageId: response.data.messageId,
      status: response.data.status,
      to: cleanNumber
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error enviando respuesta automática:', error.response?.data || error.message);
    return false;
  }
};

// Escalar conversación a agente humano
const escalateToHuman = async (phoneNumber, conversationId, messageData) => {
  try {
    console.log('👤 Escalando a agente humano:', phoneNumber);
    
    // Mensaje de escalamiento
    const escalationMessage = `Te conectaré con un agente humano. 👨‍💼

Un miembro de nuestro equipo se pondrá en contacto contigo en los próximos minutos.

**Tu consulta**: "${messageData.content?.substring(0, 100)}${messageData.content?.length > 100 ? '...' : ''}"

Mientras tanto, mantén este chat abierto. ⏳`;

    // Enviar mensaje de escalamiento
    await sendAutomaticResponse(phoneNumber, escalationMessage);
    
    // Notificar al equipo (esto puede ser email, Slack, etc.)
    await notifyTeamForEscalation({
      phoneNumber,
      conversationId,
      originalMessage: messageData.content,
      senderName: messageData.senderName,
      timestamp: messageData.timestamp
    });
    
    return true;
    
  } catch (error) {
    console.error('❌ Error escalando a humano:', error);
    return false;
  }
};

// Notificar al equipo sobre escalamiento (implementar según necesidades)
const notifyTeamForEscalation = async (escalationData) => {
  try {
    // Aquí puedes implementar:
    // - Envío de email al equipo
    // - Notificación a Slack
    // - Webhook a sistema CRM
    // - etc.
    
    console.log('🚨 Notificación de escalamiento:', {
      phone: escalationData.phoneNumber,
      time: escalationData.timestamp,
      preview: escalationData.originalMessage?.substring(0, 50)
    });
    
    // Ejemplo: Log estructurado para monitoreo
    const escalationLog = {
      type: 'human_escalation',
      timestamp: new Date().toISOString(),
      customer: {
        phone: escalationData.phoneNumber,
        name: escalationData.senderName
      },
      conversation: {
        id: escalationData.conversationId,
        original_message: escalationData.originalMessage
      },
      requires_action: true
    };
    
    // En producción: enviar a sistema de monitoreo/alertas
    console.log('📊 Escalation Log:', JSON.stringify(escalationLog, null, 2));
    
  } catch (error) {
    console.error('❌ Error notificando escalamiento:', error);
  }
};

// Función para training/mejora del modelo basado en feedback
const recordFeedback = async (messageId, intent, wasHelpful) => {
  try {
    // Aquí puedes implementar lógica para mejorar la detección de intents
    // basándote en el feedback de los usuarios
    
    console.log('📝 Feedback recibido:', {
      messageId,
      intent,
      helpful: wasHelpful
    });
    
    // En producción: guardar en base de datos para análisis
    
  } catch (error) {
    console.error('❌ Error guardando feedback:', error);
  }
};

module.exports = {
  detectIntent,
  generateResponse,
  sendAutomaticResponse,
  escalateToHuman,
  recordFeedback,
  
  // Respuestas específicas (para testing)
  generateCoinProblemResponse,
  generateWashProblemResponse,
  generateLocationInfoResponse,
  generatePricingResponse
}; 