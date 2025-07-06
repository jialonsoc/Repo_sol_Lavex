const express = require('express');
const cors = require('cors');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de Twilio
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Endpoint para enviar mensajes de WhatsApp
app.post('/send-whatsapp', async (req, res) => {
  try {
    const { to, from, body, mediaUrls } = req.body;

    console.log('🚀 Enviando mensaje de WhatsApp...');
    console.log('Para:', to);
    console.log('Desde:', from);
    console.log('Mensaje:', body);

    // Configurar el mensaje
    const messageOptions = {
      body: body,
      from: from,
      to: to,
    };

    // Agregar imágenes si existen
    if (mediaUrls && mediaUrls.length > 0) {
      messageOptions.mediaUrl = mediaUrls;
    }

    // Enviar mensaje
    const message = await client.messages.create(messageOptions);

    console.log('✅ Mensaje enviado exitosamente');
    console.log('SID:', message.sid);

    res.json({
      success: true,
      message: 'Mensaje enviado correctamente',
      sid: message.sid,
      status: message.status
    });

  } catch (error) {
    console.error('❌ Error al enviar mensaje:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error al enviar el mensaje',
      error: error.message
    });
  }
});

// Endpoint para recibir webhooks de Twilio (respuestas de WhatsApp)
app.post('/webhook', express.urlencoded({ extended: false }), (req, res) => {
  const { From, Body, MessageSid } = req.body;
  
  console.log('📨 Mensaje recibido de WhatsApp:');
  console.log('De:', From);
  console.log('Contenido:', Body);
  console.log('SID:', MessageSid);

  // Aquí puedes agregar lógica para procesar las respuestas
  // Por ejemplo, guardar en base de datos, enviar notificaciones, etc.

  // Responder con un mensaje automático (opcional)
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message('Gracias por tu mensaje. Un representante se pondrá en contacto contigo pronto.');

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

// Endpoint de estado
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor WhatsApp Twilio funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para obtener el estado de Twilio
app.get('/twilio-status', async (req, res) => {
  try {
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    
    res.json({
      status: 'OK',
      account: {
        sid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      message: 'No se pudo conectar con Twilio',
      error: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`🔗 URL de salud: http://localhost:${PORT}/health`);
}); 