import { FormDataType, ArchivosType } from '../types/FormTypes';

interface WhatsAppConfig {
  phoneNumber: string;
  messageTemplate: (data: {
    formData: FormDataType;
    archivos: ArchivosType;
  }) => string;
}

export const WHATSAPP_CONFIG: WhatsAppConfig = {
  
  phoneNumber: '56958292939', // Reemplaza con el número real
  messageTemplate: ({ formData }) => {
    return `*Nuevo Reclamo*
ID Máquina: ${formData.idMaquina}
Tipo de Máquina: ${formData.tipoMaquina}
Número de Máquina: ${formData.numeroMaquina}
Tipo de Problema: ${formData.tipoProblema}
${formData.tipoPago ? `Tipo de Pago: ${formData.tipoPago}` : ''}
${formData.ultimosDigitos ? `Últimos 4 dígitos: ${formData.ultimosDigitos}` : ''}
${formData.explicacion ? `Explicación: ${formData.explicacion}` : ''}`;
  }
}; 