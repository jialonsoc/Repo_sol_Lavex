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
} from 'react-native';
import { TipoProblema } from '../types/FormTypes';
import { useFormulario } from '../hooks/useFormulario';
import { colors } from '../theme/colors';

const FormularioReclamos: React.FC = () => {
  const { formData, archivos, isSubmitting, handleInputChange, pickImage, handleSubmit } = useFormulario();

  const renderCamposAdicionales = () => {
    switch (formData.tipoProblema as TipoProblema) {
      case '1': // Out of Order, Overflow, EFL
        return (
          <>
            <TouchableOpacity
              style={styles.fileButton}
              onPress={() => pickImage('fotoMaquina')}
            >
              <Text style={styles.fileButtonText}>📸 Seleccionar Foto de la máquina</Text>
            </TouchableOpacity>
            {archivos.fotoMaquina && (
              <Image source={{ uri: archivos.fotoMaquina }} style={styles.previewImage} />
            )}

            <TouchableOpacity
              style={styles.fileButton}
              onPress={() => pickImage('fotoComprobante')}
            >
              <Text style={styles.fileButtonText}>📸 Seleccionar Foto del comprobante</Text>
            </TouchableOpacity>
            {archivos.fotoComprobante && (
              <Image source={{ uri: archivos.fotoComprobante }} style={styles.previewImage} />
            )}
          </>
        );

      case '2': // Pagó app y no se activó
        return (
          <>
            <TouchableOpacity
              style={styles.fileButton}
              onPress={() => pickImage('fotoMaquina')}
            >
              <Text style={styles.fileButtonText}>📸 Seleccionar Foto de la máquina</Text>
            </TouchableOpacity>
            {archivos.fotoMaquina && (
              <Image source={{ uri: archivos.fotoMaquina }} style={styles.previewImage} />
            )}

            <Text style={styles.label}>💳 Tipo de Pago</Text>
            <View style={styles.selectContainer}>
              <TouchableOpacity
                style={[
                  styles.selectOption,
                  formData.tipoPago === 'webpay-tarjeta' && styles.selectedOption
                ]}
                onPress={() => handleInputChange('tipoPago', 'webpay-tarjeta')}
              >
                <Text style={styles.selectOptionText}>💳 Webpay - Tarjeta</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.selectOption,
                  formData.tipoPago === 'webpay-onepay' && styles.selectedOption
                ]}
                onPress={() => handleInputChange('tipoPago', 'webpay-onepay')}
              >
                <Text style={styles.selectOptionText}>📱 Webpay - One Pay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.selectOption,
                  formData.tipoPago === 'monedero' && styles.selectedOption
                ]}
                onPress={() => handleInputChange('tipoPago', 'monedero')}
              >
                <Text style={styles.selectOptionText}>💰 Monedero</Text>
              </TouchableOpacity>
            </View>

            {formData.tipoPago === 'webpay-tarjeta' && (
              <TextInput
                style={styles.input}
                placeholder="Últimos 4 dígitos de la tarjeta"
                value={formData.ultimosDigitos}
                onChangeText={(value) => handleInputChange('ultimosDigitos', value)}
                keyboardType="numeric"
                maxLength={4}
              />
            )}
          </>
        );

      case '5': // Monedas caen mal
        return (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>💡 Posibles soluciones:</Text>
              <Text style={styles.infoText}>• Verificar que las monedas estén limpias y no dañadas</Text>
              <Text style={styles.infoText}>• Asegurarse de insertar las monedas una por una</Text>
              <Text style={styles.infoText}>• Revisar que el monedero no esté obstruido</Text>
            </View>

            <TouchableOpacity
              style={styles.fileButton}
              onPress={() => pickImage('fotoMaquina')}
            >
              <Text style={styles.fileButtonText}>📸 Seleccionar Foto de la máquina</Text>
            </TouchableOpacity>
            {archivos.fotoMaquina && (
              <Image source={{ uri: archivos.fotoMaquina }} style={styles.previewImage} />
            )}

            <TouchableOpacity
              style={styles.fileButton}
              onPress={() => pickImage('fotoMonedero')}
            >
              <Text style={styles.fileButtonText}>📸 Seleccionar Foto del monedero</Text>
            </TouchableOpacity>
            {archivos.fotoMonedero && (
              <Image source={{ uri: archivos.fotoMonedero }} style={styles.previewImage} />
            )}
          </>
        );

      case '8': // Revisión técnica
        return (
          <>
            <TouchableOpacity
              style={styles.fileButton}
              onPress={() => pickImage('fotoEquipo')}
            >
              <Text style={styles.fileButtonText}>📸 Seleccionar Foto del equipo</Text>
            </TouchableOpacity>
            {archivos.fotoEquipo && (
              <Image source={{ uri: archivos.fotoEquipo }} style={styles.previewImage} />
            )}

            <Text style={styles.label}>📝 Explicación del problema</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.explicacion}
              onChangeText={(value) => handleInputChange('explicacion', value)}
              multiline
              numberOfLines={4}
              placeholder="Describe detalladamente el problema..."
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💬 Reclamos WhatsApp</Text>
        <Text style={styles.subtitle}>Conecta automáticamente con servicio al cliente</Text>
      </View>
      
      <Text style={styles.label}>🏷️ ID de Máquina</Text>
      <TextInput
        style={styles.input}
        value={formData.idMaquina}
        onChangeText={(value) => handleInputChange('idMaquina', value)}
        placeholder="Ingresa el ID de la máquina"
      />

      <Text style={styles.label}>🧺 Tipo de Máquina</Text>
      <View style={styles.selectContainer}>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.tipoMaquina === 'lavadora' && styles.selectedOption
          ]}
          onPress={() => handleInputChange('tipoMaquina', 'lavadora')}
        >
          <Text style={styles.selectOptionText}>🧺 Lavadora</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.tipoMaquina === 'secadora' && styles.selectedOption
          ]}
          onPress={() => handleInputChange('tipoMaquina', 'secadora')}
        >
          <Text style={styles.selectOptionText}>🌪️ Secadora</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>🔢 Número de Máquina</Text>
      <TextInput
        style={styles.input}
        value={formData.numeroMaquina}
        onChangeText={(value) => handleInputChange('numeroMaquina', value)}
        keyboardType="numeric"
        placeholder="Ingresa el número de la máquina"
      />

      <Text style={styles.label}>⚠️ Tipo de Problema</Text>
      <View style={styles.selectContainer}>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.tipoProblema === '1' && styles.selectedOption
          ]}
          onPress={() => handleInputChange('tipoProblema', '1')}
        >
          <Text style={styles.selectOptionText}>⚠️ Out of Order, Overflow, EFL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.tipoProblema === '2' && styles.selectedOption
          ]}
          onPress={() => handleInputChange('tipoProblema', '2')}
        >
          <Text style={styles.selectOptionText}>💳 Pagó app y no se activó</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.tipoProblema === '5' && styles.selectedOption
          ]}
          onPress={() => handleInputChange('tipoProblema', '5')}
        >
          <Text style={styles.selectOptionText}>🪙 Monedas caen mal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.tipoProblema === '8' && styles.selectedOption
          ]}
          onPress={() => handleInputChange('tipoProblema', '8')}
        >
          <Text style={styles.selectOptionText}>🔧 Revisión técnica</Text>
        </TouchableOpacity>
      </View>

      {renderCamposAdicionales()}

      <TouchableOpacity 
        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.text.light} />
            <Text style={styles.loadingText}>Conectando con WhatsApp...</Text>
          </View>
        ) : (
          <Text style={styles.submitButtonText}>💬 Enviar por WhatsApp</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📞 Se abrirá automáticamente una conversación con nuestro servicio al cliente
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background.primary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    color: colors.text.primary,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  selectOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: colors.background.secondary,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectOptionText: {
    color: colors.text.primary,
    fontSize: 14,
  },
  fileButton: {
    backgroundColor: colors.background.secondary,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 15,
    alignItems: 'center',
  },
  fileButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 8,
  },
  infoBox: {
    backgroundColor: colors.background.secondary,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text.primary,
  },
  infoText: {
    marginBottom: 5,
    color: colors.text.primary,
  },
  submitButton: {
    backgroundColor: '#25D366', // Color verde de WhatsApp
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: colors.secondary,
  },
  submitButtonText: {
    color: colors.text.light,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text.light,
    marginLeft: 10,
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
  },
  footerText: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 14,
  },
});

export default FormularioReclamos; 