import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { TipoProblema } from '../types/FormTypes';
import { useFormulario } from '../hooks/useFormulario';
import { colors } from '../theme/colors';

const FormularioReclamos: React.FC = () => {
  const { formData, archivos, handleInputChange, pickImage, handleSubmit } = useFormulario();

  const renderCamposAdicionales = () => {
    switch (formData.tipoProblema as TipoProblema) {
      case '1': // Out of Order, Overflow, EFL
        return (
          <>
            <TouchableOpacity
              style={styles.fileButton}
              onPress={() => pickImage('fotoMaquina')}
            >
              <Text>Seleccionar Foto de la máquina</Text>
            </TouchableOpacity>
            {archivos.fotoMaquina && (
              <Image source={{ uri: archivos.fotoMaquina }} style={styles.previewImage} />
            )}

            <TouchableOpacity
              style={styles.fileButton}
              onPress={() => pickImage('fotoComprobante')}
            >
              <Text>Seleccionar Foto del comprobante</Text>
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
              <Text>Seleccionar Foto de la máquina</Text>
            </TouchableOpacity>
            {archivos.fotoMaquina && (
              <Image source={{ uri: archivos.fotoMaquina }} style={styles.previewImage} />
            )}

            <Text style={styles.label}>Tipo de Pago</Text>
            <View style={styles.selectContainer}>
              <TouchableOpacity
                style={[
                  styles.selectOption,
                  formData.tipoPago === 'webpay-tarjeta' && styles.selectedOption
                ]}
                onPress={() => handleInputChange('tipoPago', 'webpay-tarjeta')}
              >
                <Text>Webpay - Tarjeta</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.selectOption,
                  formData.tipoPago === 'webpay-onepay' && styles.selectedOption
                ]}
                onPress={() => handleInputChange('tipoPago', 'webpay-onepay')}
              >
                <Text>Webpay - One Pay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.selectOption,
                  formData.tipoPago === 'monedero' && styles.selectedOption
                ]}
                onPress={() => handleInputChange('tipoPago', 'monedero')}
              >
                <Text>Monedero</Text>
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
              <Text style={styles.infoTitle}>Posibles soluciones:</Text>
              <Text style={styles.infoText}>• Verificar que las monedas estén limpias y no dañadas</Text>
              <Text style={styles.infoText}>• Asegurarse de insertar las monedas una por una</Text>
              <Text style={styles.infoText}>• Revisar que el monedero no esté obstruido</Text>
            </View>

            <TouchableOpacity
              style={styles.fileButton}
              onPress={() => pickImage('fotoMaquina')}
            >
              <Text>Seleccionar Foto de la máquina</Text>
            </TouchableOpacity>
            {archivos.fotoMaquina && (
              <Image source={{ uri: archivos.fotoMaquina }} style={styles.previewImage} />
            )}

            <TouchableOpacity
              style={styles.fileButton}
              onPress={() => pickImage('fotoMonedero')}
            >
              <Text>Seleccionar Foto del monedero</Text>
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
              <Text>Seleccionar Foto del equipo</Text>
            </TouchableOpacity>
            {archivos.fotoEquipo && (
              <Image source={{ uri: archivos.fotoEquipo }} style={styles.previewImage} />
            )}

            <Text style={styles.label}>Explicación del problema</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.explicacion}
              onChangeText={(value) => handleInputChange('explicacion', value)}
              multiline
              numberOfLines={4}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Formulario de Reclamos</Text>
      
      <Text style={styles.label}>ID de Máquina</Text>
      <TextInput
        style={styles.input}
        value={formData.idMaquina}
        onChangeText={(value) => handleInputChange('idMaquina', value)}
      />

      <Text style={styles.label}>Tipo de Máquina</Text>
      <View style={styles.selectContainer}>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.tipoMaquina === 'lavadora' && styles.selectedOption
          ]}
          onPress={() => handleInputChange('tipoMaquina', 'lavadora')}
        >
          <Text>Lavadora</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.tipoMaquina === 'secadora' && styles.selectedOption
          ]}
          onPress={() => handleInputChange('tipoMaquina', 'secadora')}
        >
          <Text>Secadora</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Número de Máquina</Text>
      <TextInput
        style={styles.input}
        value={formData.numeroMaquina}
        onChangeText={(value) => handleInputChange('numeroMaquina', value)}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Tipo de Problema</Text>
      <View style={styles.selectContainer}>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.tipoProblema === '1' && styles.selectedOption
          ]}
          onPress={() => handleInputChange('tipoProblema', '1')}
        >
          <Text>Out of Order, Overflow, EFL</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.tipoProblema === '2' && styles.selectedOption
          ]}
          onPress={() => handleInputChange('tipoProblema', '2')}
        >
          <Text>Pagó app y no se activó</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.tipoProblema === '5' && styles.selectedOption
          ]}
          onPress={() => handleInputChange('tipoProblema', '5')}
        >
          <Text>Monedas caen mal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.selectOption,
            formData.tipoProblema === '8' && styles.selectedOption
          ]}
          onPress={() => handleInputChange('tipoProblema', '8')}
        >
          <Text>Revisión técnica</Text>
        </TouchableOpacity>
      </View>

      {renderCamposAdicionales()}

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Enviar Reclamo</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.text.primary,
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
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    color: colors.text.primary,
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
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  fileButton: {
    backgroundColor: colors.background.secondary,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 15,
  },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 5,
  },
  infoBox: {
    backgroundColor: colors.background.secondary,
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
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
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: colors.text.light,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FormularioReclamos; 