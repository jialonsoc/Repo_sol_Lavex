import { useState } from 'react';
import { Alert, Linking } from 'react-native';
import { FormDataType, ArchivosType } from '../types/FormTypes';
import { validateForm } from '../utils/validation';
import { sendWhatsAppMessage, openWhatsAppDirect } from '../services/twilioWhatsAppService';
import * as ImagePicker from 'expo-image-picker';

export const useFormulario = () => {
  const [formData, setFormData] = useState<FormDataType>({
    idMaquina: '',
    tipoMaquina: '',
    numeroMaquina: '',
    tipoProblema: '',
    tipoPago: '',
    ultimosDigitos: '',
    explicacion: ''
  });

  const [archivos, setArchivos] = useState<ArchivosType>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (name: keyof FormDataType, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const pickImage = async (name: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería para seleccionar imágenes');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8, // Reducir calidad para WhatsApp
    });

    if (!result.canceled) {
      setArchivos(prev => ({
        ...prev,
        [name]: result.assets[0].uri
      }));
    }
  };

  const handleSubmit = async () => {
    const { isValid, errors } = validateForm(formData);

    if (!isValid) {
      Alert.alert('❌ Error', errors.join('\n'));
      return;
    }

    setIsSubmitting(true);

    try {
      // Intentar enviar via Twilio WhatsApp API
      const response = await sendWhatsAppMessage(formData, archivos);
      
      if (response.success) {
        Alert.alert(
          '✅ Éxito',
          '¡Reclamo enviado correctamente por WhatsApp!\n\nSe ha iniciado una conversación con nuestro servicio al cliente.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Limpiar formulario después del envío exitoso
                setFormData({
                  idMaquina: '',
                  tipoMaquina: '',
                  numeroMaquina: '',
                  tipoProblema: '',
                  tipoPago: '',
                  ultimosDigitos: '',
                  explicacion: ''
                });
                setArchivos({});
              }
            }
          ]
        );
      } else {
        // Si falla la API, ofrecer abrir WhatsApp directamente
        Alert.alert(
          '⚠️ Error del servicio',
          'No se pudo enviar automáticamente. ¿Quieres abrir WhatsApp manualmente?',
          [
            {
              text: 'Cancelar',
              style: 'cancel'
            },
            {
              text: 'Abrir WhatsApp',
              onPress: () => {
                const whatsappUrl = openWhatsAppDirect(formData, archivos);
                Linking.openURL(whatsappUrl);
              }
            }
          ]
        );
      }
    } catch (error) {
      // Fallback: abrir WhatsApp directamente
      Alert.alert(
        '📵 Error de conexión',
        'No se pudo conectar al servicio. ¿Quieres abrir WhatsApp directamente?',
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Abrir WhatsApp',
            onPress: () => {
              const whatsappUrl = openWhatsAppDirect(formData, archivos);
              Linking.openURL(whatsappUrl);
            }
          }
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    archivos,
    isSubmitting,
    handleInputChange,
    pickImage,
    handleSubmit
  };
}; 