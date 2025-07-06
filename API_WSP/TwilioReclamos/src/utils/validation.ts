import { FormDataType } from '../types/FormTypes';

export const validateForm = (formData: FormDataType): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!formData.idMaquina) {
    errors.push('El ID de máquina es requerido');
  }

  if (!formData.tipoMaquina) {
    errors.push('El tipo de máquina es requerido');
  }

  if (!formData.numeroMaquina) {
    errors.push('El número de máquina es requerido');
  }

  if (!formData.tipoProblema) {
    errors.push('El tipo de problema es requerido');
  }

  if (formData.tipoProblema === '2' && !formData.tipoPago) {
    errors.push('El tipo de pago es requerido para este tipo de problema');
  }

  if (formData.tipoPago === 'webpay-tarjeta' && !formData.ultimosDigitos) {
    errors.push('Los últimos 4 dígitos son requeridos para pago con tarjeta');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 