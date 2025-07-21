import { FormDataType, ArchivosType, GupshupMessage, GupshupResponse } from '../types/FormTypes';
import { GUPSHUP_CONFIG } from '../config/gupshup';
import { Linking } from 'react-native';

// Función principal para enviar mensaje vía Gupshup
export const sendGupshupMessage = async (formData: FormDataType, archivos: ArchivosType): Promise<GupshupResponse> => {
  try {
    console.log('🚀 Iniciando envío vía Gupshup API...');
    
    // 1. Intentar envío vía backend
    const backendResponse = await sendViaBackend(formData, archivos);
    if (backendResponse.success) {
      console.log('✅ Mensaje enviado exitosamente vía backend');
      return backendResponse;
    }
    
    console.log('⚠️ Fallo backend, intentando API directa...');
    
    // 2. Fallback: API directa de Gupshup
    const directResponse = await sendViaGupshupAPI(formData, archivos);
    if (directResponse.success) {
      console.log('✅ Mensaje enviado exitosamente vía API directa');
      return directResponse;
    }
    
    console.log('⚠️ Fallo API directa, usando WhatsApp Web...');
    
    // 3. Fallback final: WhatsApp Web
    const whatsappUrl = openWhatsAppDirect(formData, archivos);
    return {
      success: true,
      messageId: 'fallback-web',
      fallbackUrl: whatsappUrl
    };
    
  } catch (error) {
    console.error('❌ Error completo en envío:', error);
    
    // Fallback de emergencia: WhatsApp Web
    const whatsappUrl = openWhatsAppDirect(formData, archivos);
    return {
      success: true,
      messageId: 'emergency-fallback',
      fallbackUrl: whatsappUrl
    };
  }
};

// 1. Envío vía backend (recomendado)
const sendViaBackend = async (formData: FormDataType, archivos: ArchivosType): Promise<GupshupResponse> => {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
    
    const response = await fetch(`${backendUrl}/send-gupshup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        formData,
        archivos
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      messageId: result.messageId || 'backend-success',
      response: result
    };
  } catch (error) {
    console.error('Error enviando vía backend:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown backend error'
    };
  }
};

// 2. Envío directo vía Gupshup API
const sendViaGupshupAPI = async (formData: FormDataType, archivos: ArchivosType): Promise<GupshupResponse> => {
  try {
    if (!GUPSHUP_CONFIG.apiKey) {
      throw new Error('Gupshup API Key no configurada');
    }

    const mensaje = GUPSHUP_CONFIG.messageTemplate({ formData, archivos });
    
    // Preparar datos para Gupshup API
    const messageData = {
      channel: 'whatsapp',
      source: GUPSHUP_CONFIG.sourceNumber,
      destination: GUPSHUP_CONFIG.targetNumber,
      'src.name': GUPSHUP_CONFIG.appName,
      'destination.name': formData.nombre,
      message: JSON.stringify({
        type: 'text',
        text: mensaje
      })
    };

    // Enviar via URLSearchParams (formato requerido por Gupshup)
    const formDataParams = new URLSearchParams();
    Object.entries(messageData).forEach(([key, value]) => {
      formDataParams.append(key, value);
    });

    const response = await fetch(GUPSHUP_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': GUPSHUP_CONFIG.apiKey
      },
      body: formDataParams.toString()
    });

    if (!response.ok) {
      throw new Error(`Gupshup API error: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      messageId: result.messageId || 'gupshup-direct',
      response: result
    };
    
  } catch (error) {
    console.error('Error enviando vía Gupshup API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Gupshup API error'
    };
  }
};

// 3. Fallback: Abrir WhatsApp Web
export const openWhatsAppDirect = (formData: FormDataType, archivos: ArchivosType): string => {
  const mensaje = GUPSHUP_CONFIG.messageTemplate({ formData, archivos });
  const mensajeCodificado = encodeURIComponent(mensaje);
  const whatsappUrl = `https://wa.me/${GUPSHUP_CONFIG.targetNumber.replace('+', '')}?text=${mensajeCodificado}`;
  
  // Abrir WhatsApp Web
  Linking.openURL(whatsappUrl).catch(err => 
    console.error('Error abriendo WhatsApp:', err)
  );
  
  return whatsappUrl;
};

// Función para enviar imagen (si es necesario)
export const sendGupshupImage = async (
  imageUri: string, 
  caption: string, 
  formData: FormDataType
): Promise<GupshupResponse> => {
  try {
    if (!GUPSHUP_CONFIG.apiKey) {
      throw new Error('Gupshup API Key no configurada');
    }

    const messageData = {
      channel: 'whatsapp',
      source: GUPSHUP_CONFIG.sourceNumber,
      destination: GUPSHUP_CONFIG.targetNumber,
      'src.name': GUPSHUP_CONFIG.appName,
      'destination.name': formData.nombre,
      message: JSON.stringify({
        type: 'image',
        originalUrl: imageUri,
        previewUrl: imageUri,
        caption: caption
      })
    };

    const formDataParams = new URLSearchParams();
    Object.entries(messageData).forEach(([key, value]) => {
      formDataParams.append(key, value);
    });

    const response = await fetch(GUPSHUP_CONFIG.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'apikey': GUPSHUP_CONFIG.apiKey
      },
      body: formDataParams.toString()
    });

    if (!response.ok) {
      throw new Error(`Gupshup API error: ${response.status}`);
    }

    const result = await response.json();
    
    return {
      success: true,
      messageId: result.messageId || 'gupshup-image',
      response: result
    };
    
  } catch (error) {
    console.error('Error enviando imagen vía Gupshup:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown image error'
    };
  }
}; 