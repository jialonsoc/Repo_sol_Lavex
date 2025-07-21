import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import { useFormulario } from '../hooks/useFormulario';
import { TIPOS_PROBLEMAS } from '../config/gupshup';
import { COLORS } from '../theme/colors';

const FormularioReclamosGupshup = () => {
  const {
    formData,
    archivos,
    isSubmitting,
    handleInputChange,
    pickImage,
    removeFile,
    handleSubmit,
    hasFormData
  } = useFormulario();

  const renderCamposAdicionales = () => {
    switch (formData.tipoProblema) {
      case 'maquina':
      case 'lavado':
      case 'secado':
        return (
          <View style={styles.campoContainer}>
            <Text style={styles.label}>Número de Máquina *</Text>
            <TextInput
              style={styles.input}
              value={formData.numeroMaquina}
              onChangeText={(value) => handleInputChange('numeroMaquina', value)}
              placeholder="Ej: Máquina 5, Lavadora A2, etc."
              placeholderTextColor={COLORS.gray400}
            />
          </View>
        );

      case 'dinero':
        return (
          <View style={styles.campoContainer}>
            <Text style={styles.label}>Monto de Recarga *</Text>
            <TextInput
              style={styles.input}
              value={formData.montoRecarga}
              onChangeText={(value) => handleInputChange('montoRecarga', value)}
              placeholder="Ej: 2000, 5000, etc."
              keyboardType="numeric"
              placeholderTextColor={COLORS.gray400}
            />
          </View>
        );

      case 'lavado':
        return (
          <>
            <View style={styles.campoContainer}>
              <Text style={styles.label}>Número de Máquina *</Text>
              <TextInput
                style={styles.input}
                value={formData.numeroMaquina}
                onChangeText={(value) => handleInputChange('numeroMaquina', value)}
                placeholder="Ej: Máquina 5, Lavadora A2, etc."
                placeholderTextColor={COLORS.gray400}
              />
            </View>
            <View style={styles.campoContainer}>
              <Text style={styles.label}>Tipo de Lavado *</Text>
              <TextInput
                style={styles.input}
                value={formData.tipoLavado}
                onChangeText={(value) => handleInputChange('tipoLavado', value)}
                placeholder="Ej: Lavado normal, Delicado, etc."
                placeholderTextColor={COLORS.gray400}
              />
            </View>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 Gupshup Reclamos</Text>
        <Text style={styles.headerSubtitle}>Sistema de Reclamos con IA Conversacional</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            💡 Envía tu reclamo vía Gupshup WhatsApp Business API. 
            Nuestro sistema de IA conversacional te ayudará a resolver tu problema rápidamente.
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Datos Personales */}
          <View style={styles.seccionContainer}>
            <Text style={styles.seccionTitulo}>📋 Datos Personales</Text>
            
            <View style={styles.campoContainer}>
              <Text style={styles.label}>Nombre Completo *</Text>
              <TextInput
                style={styles.input}
                value={formData.nombre}
                onChangeText={(value) => handleInputChange('nombre', value)}
                placeholder="Tu nombre completo"
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            <View style={styles.campoContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={COLORS.gray400}
              />
            </View>

            <View style={styles.campoContainer}>
              <Text style={styles.label}>Teléfono *</Text>
              <TextInput
                style={styles.input}
                value={formData.telefono}
                onChangeText={(value) => handleInputChange('telefono', value)}
                placeholder="+56912345678"
                keyboardType="phone-pad"
                placeholderTextColor={COLORS.gray400}
              />
            </View>
          </View>

          {/* Problema */}
          <View style={styles.seccionContainer}>
            <Text style={styles.seccionTitulo}>🔧 Detalles del Problema</Text>
            
            <View style={styles.campoContainer}>
              <Text style={styles.label}>Tipo de Problema *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.tipoProblema}
                  onValueChange={(value) => handleInputChange('tipoProblema', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecciona un tipo de problema" value="" />
                  {Object.entries(TIPOS_PROBLEMAS).map(([key, value]) => (
                    <Picker.Item key={key} label={value} value={key} />
                  ))}
                </Picker>
              </View>
            </View>

            {renderCamposAdicionales()}

            <View style={styles.campoContainer}>
              <Text style={styles.label}>Descripción del Problema *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.descripcion}
                onChangeText={(value) => handleInputChange('descripcion', value)}
                placeholder="Describe detalladamente el problema que experimentaste..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor={COLORS.gray400}
              />
            </View>
          </View>

          {/* Archivos */}
          <View style={styles.seccionContainer}>
            <Text style={styles.seccionTitulo}>📎 Archivos Adjuntos</Text>
            <Text style={styles.seccionSubtitulo}>
              Adjunta fotos del problema para una mejor atención
            </Text>
            
            <TouchableOpacity
              style={styles.adjuntarButton}
              onPress={() => pickImage('evidencia')}
              disabled={isSubmitting}
            >
              <Text style={styles.adjuntarButtonText}>📷 Adjuntar Foto</Text>
            </TouchableOpacity>

            {/* Mostrar archivos adjuntos */}
            {Object.entries(archivos).map(([key, archivo]) => (
              <View key={key} style={styles.archivoContainer}>
                <Image source={{ uri: archivo.uri }} style={styles.archivoImagen} />
                <View style={styles.archivoInfo}>
                  <Text style={styles.archivoNombre}>{archivo.name}</Text>
                  <TouchableOpacity
                    onPress={() => removeFile(key)}
                    style={styles.eliminarButton}
                  >
                    <Text style={styles.eliminarButtonText}>🗑️ Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Botón de Envío */}
          <TouchableOpacity
            style={[
              styles.enviarButton,
              (!hasFormData() || isSubmitting) && styles.enviarButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!hasFormData() || isSubmitting}
          >
            {isSubmitting ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={COLORS.textOnPrimary} size="small" />
                <Text style={styles.enviarButtonText}>Enviando...</Text>
              </View>
            ) : (
              <Text style={styles.enviarButtonText}>
                🚀 Enviar Reclamo via Gupshup
              </Text>
            )}
          </TouchableOpacity>

          {/* Información de IA */}
          <View style={styles.iaInfoContainer}>
            <Text style={styles.iaInfoText}>
              🤖 <Text style={styles.iaInfoBold}>IA Conversacional Gupshup:</Text> {'\n'}
              Nuestro sistema automatizado responderá a problemas comunes al instante. 
              Para casos complejos, serás conectado con un agente humano.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textOnPrimary,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textOnPrimary,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  infoContainer: {
    backgroundColor: COLORS.primaryLight,
    margin: 15,
    padding: 15,
    borderRadius: 10,
  },
  infoText: {
    color: COLORS.textOnPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    padding: 15,
  },
  seccionContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  seccionSubtitulo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  campoContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: COLORS.background,
    color: COLORS.textPrimary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  picker: {
    height: 50,
    color: COLORS.textPrimary,
  },
  adjuntarButton: {
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  adjuntarButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 16,
    fontWeight: '500',
  },
  archivoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  archivoImagen: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  archivoInfo: {
    flex: 1,
  },
  archivoNombre: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  eliminarButton: {
    marginTop: 5,
  },
  eliminarButtonText: {
    color: COLORS.error,
    fontSize: 12,
  },
  enviarButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  enviarButtonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  enviarButtonText: {
    color: COLORS.textOnPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iaInfoContainer: {
    backgroundColor: COLORS.info + '20',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  iaInfoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  iaInfoBold: {
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

export default FormularioReclamosGupshup; 