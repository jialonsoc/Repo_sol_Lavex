export interface FormDataType {
  idMaquina: string;
  tipoMaquina: string;
  numeroMaquina: string;
  tipoProblema: string;
  tipoPago: string;
  ultimosDigitos: string;
  explicacion: string;
}

export interface ArchivosType {
  [key: string]: string | null;
}

export type TipoMaquina = 'lavadora' | 'secadora';

export type TipoProblema = 
  | '1'  // Out of Order, Overflow, EFL
  | '2'  // Pagó app y no se activó
  | '3'  // Pago app y marcó saldo deficiente
  | '4'  // Recargó monedero y no se acredita
  | '5'  // Las monedas caen mal
  | '6'  // Ropa mal lavada
  | '7'  // Secadora no secó
  | '8'; // Solicita revisión técnica

export type TipoPago = 'webpay-tarjeta' | 'webpay-onepay' | 'monedero'; 