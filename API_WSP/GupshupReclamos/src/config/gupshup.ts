import { FormDataType, ArchivosType, GupshupConfig } from '../types/FormTypes';

// Tipos de problemas específicos para lavandería
export const TIPOS_PROBLEMAS = {
  monedas: 'Problemas con monedas',
  lavado: 'Problemas con el lavado',
  secado: 'Problemas con el secado',
  maquina: 'Máquina no funciona',
  dinero: 'Problemas con recargas',
  otro: 'Otro problema'
};

export const GUPSHUP_CONFIG: GupshupConfig = {
  // Credenciales de Gupshup (deben configurarse en variables de entorno)
  apiKey: process.env.GUPSHUP_API_KEY || '',
  appName: process.env.GUPSHUP_APP_NAME || 'ReclamosLavanderia',
  
  // Números de teléfono
  sourceNumber: process.env.GUPSHUP_SOURCE_NUMBER || '56958292939',
  targetNumber: process.env.GUPSHUP_TARGET_NUMBER || '56958292939',
  
  // URL de la API de Gupshup
  apiUrl: 'https://api.gupshup.io/sm/api/v1/msg',
  
  // Template del mensaje
  messageTemplate: ({ formData, archivos }) => {
    const problemaDescripcion = TIPOS_PROBLEMAS[formData.tipoProblema as keyof typeof TIPOS_PROBLEMAS] || formData.tipoProblema;
    
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
    const archivosAdjuntos = Object.keys(archivos);
    if (archivosAdjuntos.length > 0) {
      mensaje += `\n📎 *Archivos adjuntos:* ${archivosAdjuntos.length} archivo(s)\n`;
      archivosAdjuntos.forEach((key, index) => {
        mensaje += `   ${index + 1}. ${archivos[key].name}\n`;
      });
    }

    mensaje += `\n⏰ *Fecha:* ${new Date().toLocaleString('es-CL')}\n`;
    mensaje += `🤖 *Enviado vía:* Gupshup WhatsApp Business API`;

    return mensaje;
  }
}; 