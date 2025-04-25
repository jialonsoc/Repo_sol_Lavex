import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import FormularioReclamos from './src/components/FormularioReclamos';

export default function App() {
  return (
    <SafeAreaProvider>
      <FormularioReclamos />
    </SafeAreaProvider>
  );
} 