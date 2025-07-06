import { FormDataType, ArchivosType } from '../types/FormTypes';

interface TwilioWhatsAppConfig {
  accountSid: string;
  authToken: string;
  whatsappNumber: string; // Número de WhatsApp Business de Twilio
  targetWhatsAppNumber: string; // Número de destino (servicio al cliente)
  messageTemplate: (data: {
    formData: FormDataType;
    archivos: ArchivosType;
  }) => string;
}

// Mapear los tipos de problemas
export const TIPOS_PROBLEMAS = {
  '1': 'Out of Order, Overflow, EFL',
  '2': 'Pagó app y no se activó',
  '3': 'Pago app y marcó saldo deficiente',
  '4': 'Recargó monedero y no se acredita',
  '5': 'Las monedas caen mal',
  '6': 'Ropa mal lavada',
  '7': 'Secadora no secó',
  '8': 'Solicita revisión técnica'
};

export const TWILIO_WHATSAPP_CONFIG: TwilioWhatsAppConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886', // Sandbox de Twilio
  targetWhatsAppNumber: process.env.TARGET_WHATSAPP_NUMBER || 'whatsapp:+56958292939', // Servicio al cliente
  messageTemplate: ({ formData }) => {
    return `🔧 *NUEVO RECLAMO LAVEX*

📋 *Detalles del Reclamo:*
• ID Máquina: ${formData.idMaquina}
• Tipo: ${formData.tipoMaquina}
• Número: ${formData.numeroMaquina}
• Problema: ${TIPOS_PROBLEMAS[formData.tipoProblema as keyof typeof TIPOS_PROBLEMAS]}
${formData.tipoPago ? `• Pago: ${formData.tipoPago}` : ''}
${formData.ultimosDigitos ? `• Últimos 4 dígitos: ${formData.ultimosDigitos}` : ''}
${formData.explicacion ? `• Explicación: ${formData.explicacion}` : ''}

_Mensaje enviado automáticamente desde la app de reclamos_`;
  }
}; 