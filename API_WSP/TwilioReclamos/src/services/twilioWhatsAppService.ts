import { FormDataType, ArchivosType } from '../types/FormTypes';
import { TWILIO_WHATSAPP_CONFIG } from '../config/twilio';

export interface WhatsAppMessage {
  to: string;
  from: string;
  body: string;
  mediaUrl?: string[];
}

export interface WhatsAppResponse {
  success: boolean;
  message: string;
  sid?: string;
  error?: string;
}

// Función para enviar mensaje de WhatsApp usando Twilio
export const sendWhatsAppMessage = async (
  formData: FormDataType,
  archivos: ArchivosType
): Promise<WhatsAppResponse> => {
  try {
    const messageBody = TWILIO_WHATSAPP_CONFIG.messageTemplate({ formData, archivos });
    
    // Preparar URLs de imágenes (si existen)
    const mediaUrls = Object.values(archivos).filter(url => url !== null) as string[];
    
    // Realizar la petición HTTP a nuestro backend
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3000'}/send-whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: TWILIO_WHATSAPP_CONFIG.targetWhatsAppNumber,
        from: TWILIO_WHATSAPP_CONFIG.whatsappNumber,
        body: messageBody,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        accountSid: TWILIO_WHATSAPP_CONFIG.accountSid,
        authToken: TWILIO_WHATSAPP_CONFIG.authToken,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: '✅ Mensaje enviado a WhatsApp correctamente',
        sid: data.sid,
      };
    } else {
      return {
        success: false,
        message: '❌ Error al enviar mensaje a WhatsApp',
        error: data.error || 'Error desconocido',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: '📵 Error de conexión',
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

// Función para abrir WhatsApp directamente (como fallback)
export const openWhatsAppDirect = (formData: FormDataType, archivos: ArchivosType): string => {
  const messageBody = TWILIO_WHATSAPP_CONFIG.messageTemplate({ formData, archivos });
  const mensajeCodificado = encodeURIComponent(messageBody);
  const phoneNumber = TWILIO_WHATSAPP_CONFIG.targetWhatsAppNumber.replace('whatsapp:', '');
  
  return `https://wa.me/${phoneNumber}?text=${mensajeCodificado}`;
}; 