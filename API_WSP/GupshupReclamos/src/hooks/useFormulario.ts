import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import { FormDataType, ArchivosType } from '../types/FormTypes';
import { validateForm, sanitizeFormData } from '../utils/validation';
import { sendGupshupMessage, openWhatsAppDirect } from '../services/gupshupWhatsAppService';
import * as ImagePicker from 'expo-image-picker';

export const useFormulario = () => {
  // Estado del formulario
  const [formData, setFormData] = useState<FormDataType>({
    nombre: '',
    email: '',
    telefono: '',
    tipoProblema: '',
    descripcion: '',
    numeroMaquina: '',
    montoRecarga: '',
    tipoLavado: ''
  });

  // Estado de archivos
  const [archivos, setArchivos] = useState<ArchivosType>({});

  // Estado de carga
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejar cambios en inputs
  const handleInputChange = (name: keyof FormDataType, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Seleccionar imagen
  const pickImage = async (name: string) => {
    try {
      // Pedir permisos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios', 
          'Necesitamos acceso a tu galería para adjuntar imágenes.'
        );
        return;
      }

      // Seleccionar imagen
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = `${name}_${Date.now()}.jpg`;

        setArchivos(prev => ({
          ...prev,
          [name]: {
            uri: asset.uri,
            type: 'image/jpeg',
            name: fileName
          }
        }));

        Alert.alert('Éxito', 'Imagen adjuntada correctamente');
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  // Eliminar archivo adjunto
  const removeFile = (name: string) => {
    setArchivos(prev => {
      const newArchivos = { ...prev };
      delete newArchivos[name];
      return newArchivos;
    });
  };

  // Enviar formulario
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Limpiar y validar datos
      const cleanFormData = sanitizeFormData(formData);
      const { isValid, errors } = validateForm(cleanFormData);

      if (!isValid) {
        Alert.alert(
          'Errores de validación',
          errors.join('\n'),
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('📤 Enviando reclamo vía Gupshup...');

      // Intentar envío vía Gupshup con triple fallback
      const response = await sendGupshupMessage(cleanFormData, archivos);

      if (response.success) {
        if (response.fallbackUrl) {
          // Se usó fallback de WhatsApp Web
          Alert.alert(
            '✅ Reclamo Enviado',
            'Tu reclamo se ha enviado correctamente vía WhatsApp Web. Se abrirá WhatsApp en tu dispositivo.',
            [
              {
                text: 'OK',
                onPress: () => {
                  resetForm();
                  if (response.fallbackUrl) {
                    Linking.openURL(response.fallbackUrl);
                  }
                }
              }
            ]
          );
        } else {
          // Envío exitoso vía API
          Alert.alert(
            '✅ Reclamo Enviado',
            'Tu reclamo se ha enviado correctamente vía Gupshup WhatsApp Business API. Nuestro equipo se contactará contigo pronto.',
            [
              {
                text: 'OK',
                onPress: () => resetForm()
              }
            ]
          );
        }
      } else {
        // Error en el envío - usar fallback de emergencia
        console.log('⚠️ Error en API, usando fallback de emergencia...');
        const fallbackUrl = openWhatsAppDirect(cleanFormData, archivos);
        
        Alert.alert(
          '⚠️ Enviado por WhatsApp Web',
          'Hubo un problema con el servicio automatizado, pero tu reclamo se enviará vía WhatsApp Web.',
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                Linking.openURL(fallbackUrl);
              }
            }
          ]
        );
      }

    } catch (error) {
      console.error('❌ Error crítico en envío:', error);
      
      // Fallback de emergencia absoluto
      try {
        const cleanFormData = sanitizeFormData(formData);
        const fallbackUrl = openWhatsAppDirect(cleanFormData, archivos);
        
        Alert.alert(
          '⚠️ Error de Conexión',
          'No se pudo conectar con el servidor. Tu reclamo se enviará directamente por WhatsApp.',
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                Linking.openURL(fallbackUrl);
              }
            }
          ]
        );
      } catch (fallbackError) {
        Alert.alert(
          '❌ Error',
          'No se pudo enviar el reclamo. Verifica tu conexión e inténtalo nuevamente.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      tipoProblema: '',
      descripcion: '',
      numeroMaquina: '',
      montoRecarga: '',
      tipoLavado: ''
    });
    setArchivos({});
  };

  // Verificar si el formulario tiene datos
  const hasFormData = () => {
    return Object.values(formData).some(value => value.trim() !== '') || 
           Object.keys(archivos).length > 0;
  };

  return {
    // Estado
    formData,
    archivos,
    isSubmitting,
    
    // Acciones
    handleInputChange,
    pickImage,
    removeFile,
    handleSubmit,
    resetForm,
    
    // Utilidades
    hasFormData
  };
}; 