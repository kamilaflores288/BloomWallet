import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/colors';
import { pinStorage } from '@/hooks/usePin';
import { PinPad } from '@/components/shared/PinPad';

type Step = 'menu' | 'old-pin' | 'new-pin' | 'confirm-pin';

export default function ParentSettings() {
  const router = useRouter();
  const [step, setStep]     = useState<Step>('menu');
  const [newPin, setNewPin] = useState('');
  const [error, setError]   = useState('');

  const handleOldPin = async (pin: string) => {
    const ok = await pinStorage.verify(pin);
    if (!ok) { setError('PIN incorrecto.'); return; }
    setError(''); setStep('new-pin');
  };

  const handleNewPin = (pin: string) => { setNewPin(pin); setStep('confirm-pin'); };

  const handleConfirmPin = async (pin: string) => {
    if (pin !== newPin) { setError('Los PINs no coinciden.'); setStep('new-pin'); return; }
    await pinStorage.updatePin(pin);
    Alert.alert('¡Listo!', 'Tu PIN fue actualizado.');
    setStep('menu'); setNewPin(''); setError('');
  };

  const handleReset = () =>
    Alert.alert('Restablecer PIN', 'Deberás crear un PIN nuevo.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Restablecer', style: 'destructive', onPress: async () => { await pinStorage.reset(); router.replace('/onboarding'); } },
    ]);

  const back = () => step !== 'menu' ? setStep('menu') : router.back();

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Pressable onPress={back} style={s.backBtn}><Text style={s.backArrow}>←</Text></Pressable>
        <Text style={s.title}>Configuración</Text>
        <View style={{ width: 36 }} />
      </View>

      {step === 'menu' && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Seguridad</Text>
          {[
            { label: '🔐 Cambiar PIN', onPress: () => { setError(''); setStep('old-pin'); } },
            { label: '🔄 Restablecer PIN', onPress: handleReset, danger: true },
            { label: '👤 Cambiar perfil', onPress: () => router.replace('/profile-select') },
          ].map(item => (
            <Pressable key={item.label} style={({ pressed }) => [s.item, pressed && s.itemPressed]} onPress={item.onPress}>
              <Text style={[s.itemText, item.danger && { color: C.pink }]}>{item.label}</Text>
              <Text style={s.arrow}>›</Text>
            </Pressable>
          ))}
        </View>
      )}

      {step === 'old-pin' && (
        <View style={s.padSection}>
          <Text style={s.padTitle}>Ingresa tu PIN actual</Text>
          <PinPad onComplete={handleOldPin} errorMsg={error} />
        </View>
      )}

      {step === 'new-pin' && (
        <View style={s.padSection}>
          <Text style={s.padTitle}>Nuevo PIN</Text>
          <PinPad onComplete={handleNewPin} />
        </View>
      )}

      {step === 'confirm-pin' && (
        <View style={s.padSection}>
          <Text style={s.padTitle}>Confirma el nuevo PIN</Text>
          <PinPad onComplete={handleConfirmPin} errorMsg={error} />
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 28 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 24, color: C.text, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: C.text },
  section: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.cardBg, borderRadius: C.rmd, padding: 16, marginBottom: 8 },
  itemPressed: { transform: [{ scale: 0.98 }] },
  itemText: { fontSize: 15, fontWeight: '600', color: C.text },
  arrow: { fontSize: 20, color: C.muted },
  padSection: { alignItems: 'center', paddingTop: 16, paddingHorizontal: 24 },
  padTitle: { fontSize: 22, fontWeight: '800', color: C.text, marginBottom: 6, textAlign: 'center' },
});
