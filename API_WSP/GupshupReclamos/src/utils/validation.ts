import { FormDataType, ValidationResult } from '../types/FormTypes';

// Validar email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar teléfono chileno
export const isValidChileanPhone = (phone: string): boolean => {
  // Acepta formatos: +56912345678, 56912345678, 912345678, 9 1234 5678
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^(\+?56)?[9][0-9]{8}$/;
  return phoneRegex.test(cleanPhone);
};

// Formatear teléfono chileno
export const formatChileanPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, '');
  
  if (cleanPhone.startsWith('56')) {
    return '+' + cleanPhone;
  } else if (cleanPhone.startsWith('9') && cleanPhone.length === 9) {
    return '+56' + cleanPhone;
  }
  
  return phone;
};

// Validar formulario completo
export const validateForm = (formData: FormDataType): ValidationResult => {
  const errors: string[] = [];

  // Validar nombre
  if (!formData.nombre.trim()) {
    errors.push('El nombre es obligatorio');
  } else if (formData.nombre.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }

  // Validar email
  if (!formData.email.trim()) {
    errors.push('El email es obligatorio');
  } else if (!isValidEmail(formData.email)) {
    errors.push('El email no tiene un formato válido');
  }

  // Validar teléfono
  if (!formData.telefono.trim()) {
    errors.push('El teléfono es obligatorio');
  } else if (!isValidChileanPhone(formData.telefono)) {
    errors.push('El teléfono debe ser un número chileno válido (ej: +56912345678)');
  }

  // Validar tipo de problema
  if (!formData.tipoProblema) {
    errors.push('Debe seleccionar un tipo de problema');
  }

  // Validar descripción
  if (!formData.descripcion.trim()) {
    errors.push('La descripción del problema es obligatoria');
  } else if (formData.descripcion.trim().length < 10) {
    errors.push('La descripción debe tener al menos 10 caracteres');
  }

  // Validaciones específicas según el tipo de problema
  if (formData.tipoProblema === 'maquina' || formData.tipoProblema === 'lavado' || formData.tipoProblema === 'secado') {
    if (!formData.numeroMaquina?.trim()) {
      errors.push('El número de máquina es obligatorio para este tipo de problema');
    }
  }

  if (formData.tipoProblema === 'dinero') {
    if (!formData.montoRecarga?.trim()) {
      errors.push('El monto de recarga es obligatorio para problemas de dinero');
    } else {
      const monto = parseFloat(formData.montoRecarga);
      if (isNaN(monto) || monto <= 0) {
        errors.push('El monto de recarga debe ser un número válido mayor a 0');
      }
    }
  }

  if (formData.tipoProblema === 'lavado') {
    if (!formData.tipoLavado?.trim()) {
      errors.push('El tipo de lavado es obligatorio para problemas de lavado');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Limpiar datos del formulario
export const sanitizeFormData = (formData: FormDataType): FormDataType => {
  return {
    ...formData,
    nombre: formData.nombre.trim(),
    email: formData.email.trim().toLowerCase(),
    telefono: formatChileanPhone(formData.telefono),
    descripcion: formData.descripcion.trim(),
    numeroMaquina: formData.numeroMaquina?.trim() || '',
    montoRecarga: formData.montoRecarga?.trim() || '',
    tipoLavado: formData.tipoLavado?.trim() || ''
  };
}; 