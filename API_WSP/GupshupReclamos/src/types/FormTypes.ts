// Tipos para el formulario de reclamos
export interface FormDataType {
  nombre: string;
  email: string;
  telefono: string;
  tipoProblema: string;
  descripcion: string;
  numeroMaquina?: string;
  montoRecarga?: string;
  tipoLavado?: string;
}

export interface ArchivosType {
  [key: string]: {
    uri: string;
    type: string;
    name: string;
  };
}

// Tipos específicos para Gupshup API
export interface GupshupMessage {
  source: string;
  destination: string;
  'src.name': string;
  'destination.name': string;
  message: {
    type: 'text' | 'image';
    text?: string;
    originalUrl?: string;
    previewUrl?: string;
    caption?: string;
  };
  'message.payload.text'?: string;
  'message.payload.url'?: string;
  'message.payload.caption'?: string;
}

export interface GupshupResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  response?: any;
  fallbackUrl?: string;
}

// Configuración para Gupshup
export interface GupshupConfig {
  apiKey: string;
  appName: string;
  sourceNumber: string;
  targetNumber: string;
  apiUrl: string;
  messageTemplate: (data: { formData: FormDataType; archivos: ArchivosType }) => string;
}

// Tipos para validación
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
} 