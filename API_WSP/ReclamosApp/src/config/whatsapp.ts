import { FormDataType, ArchivosType } from '../types/FormTypes';

interface WhatsAppConfig {
  phoneNumber: string;
  messageTemplate: (data: {
    formData: FormDataType;
    archivos: ArchivosType;
  }) => string;
}

// Agregar este objeto para mapear los tipos de problemas
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

export const WHATSAPP_CONFIG: WhatsAppConfig = {
  phoneNumber: '56958292939', // Reemplaza con el número real
  messageTemplate: ({ formData }) => {
    return `*Nuevo Reclamo*
ID Máquina: ${formData.idMaquina}
Tipo de Máquina: ${formData.tipoMaquina}
Número de Máquina: ${formData.numeroMaquina}
Tipo de Problema: ${TIPOS_PROBLEMAS[formData.tipoProblema as keyof typeof TIPOS_PROBLEMAS]}
${formData.tipoPago ? `Tipo de Pago: ${formData.tipoPago}` : ''}
${formData.ultimosDigitos ? `Últimos 4 dígitos: ${formData.ultimosDigitos}` : ''}
${formData.explicacion ? `Explicación: ${formData.explicacion}` : ''}`;
  }
}; 