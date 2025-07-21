import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FormularioReclamosGupshup from './src/components/FormularioReclamosGupshup';

export default function App() {
  return (
    <SafeAreaProvider>
      <FormularioReclamosGupshup />
    </SafeAreaProvider>
  );
} 