import { useState } from 'react';
import { Alert } from 'react-native';
import { FormDataType, ArchivosType } from '../types/FormTypes';
import { validateForm } from '../utils/validation';
import { WHATSAPP_CONFIG } from '../config/whatsapp';
import * as ImagePicker from 'expo-image-picker';
import { Linking } from 'react-native';

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
      quality: 1,
    });

    if (!result.canceled) {
      setArchivos(prev => ({
        ...prev,
        [name]: result.assets[0].uri
      }));
    }
  };

  const handleSubmit = () => {
    const { isValid, errors } = validateForm(formData);

    if (!isValid) {
      Alert.alert('Error', errors.join('\n'));
      return;
    }

    const mensaje = WHATSAPP_CONFIG.messageTemplate({
      formData,
      archivos
    });

    const mensajeCodificado = encodeURIComponent(mensaje);
    const whatsappUrl = `https://wa.me/${WHATSAPP_CONFIG.phoneNumber}?text=${mensajeCodificado}`;

    Linking.openURL(whatsappUrl);
  };

  return {
    formData,
    archivos,
    handleInputChange,
    pickImage,
    handleSubmit
  };
}; 