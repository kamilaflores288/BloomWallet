import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/colors';
import { pinStorage } from '@/hooks/usePin';
import { PinPad } from '@/components/shared/PinPad';
import { useAppData } from '@/context/AppDataContext';

type Step = 'welcome' | 'names' | 'create' | 'confirm' | 'email';

export default function Onboarding() {
  const router = useRouter();
  const { updateConfig } = useAppData();

  const [step, setStep]           = useState<Step>('welcome');
  const [pin, setPin]             = useState('');
  const [error, setError]         = useState('');
  const [email, setEmail]         = useState('');
  const [parentName, setParentName] = useState('');
  const [childName, setChildName]   = useState('');

  const handleCreate = (value: string) => { setPin(value); setError(''); setStep('confirm'); };

  const handleConfirm = (value: string) => {
    if (value !== pin) { setError('Los PINs no coinciden. Intenta de nuevo.'); setPin(''); setStep('create'); return; }
    setStep('email');
  };

  const handleNamesNext = () => {
    if (!parentName.trim()) { setError('Ingresa el nombre del padre/madre.'); return; }
    if (!childName.trim())  { setError('Ingresa el nombre del niño/a.'); return; }
    setError('');
    setStep('create');
  };

  const handleSave = async () => {
    if (!email.includes('@')) { setError('Ingresa un correo válido.'); return; }
    await pinStorage.setup(pin, email);
    updateConfig({ parentName: parentName.trim(), childName: childName.trim() });
    router.replace('/profile-select');
  };

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.brand}>
        <Image source={require('@/placeholders/bloom_coin.PNG')} style={s.coinImg} resizeMode="contain" />
        <Text style={s.appName}>BloomWallet</Text>
        <Text style={s.tagline}>Aprende a gestionar tu dinero</Text>
      </View>

      {step === 'welcome' && (
        <View style={s.card}>
          <Text style={s.cardTitle}>¡Bienvenido/a! 👋</Text>
          <Text style={s.cardText}>Crea un PIN para proteger el perfil de padres. Los niños no podrán aprobar sus propias tareas.</Text>
          <Pressable style={s.primary} onPress={() => { setError(''); setStep('names'); }}>
            <Text style={s.primaryText}>Comenzar →</Text>
          </Pressable>
        </View>
      )}

      {step === 'names' && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.nameStep}>
          <Text style={s.padTitle}>Personaliza la app</Text>
          <Text style={s.padSub}>¿Cómo se llaman en casa?</Text>
          {error ? <Text style={s.error}>{error}</Text> : null}
          <View style={s.nameField}>
            <Text style={s.fieldLabel}>PADRE / MADRE</Text>
            <TextInput
              style={s.input}
              value={parentName}
              onChangeText={t => { setParentName(t); setError(''); }}
              placeholder="Ej. Mamá Laura"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
          <View style={s.nameField}>
            <Text style={s.fieldLabel}>NIÑO / NIÑA</Text>
            <TextInput
              style={s.input}
              value={childName}
              onChangeText={t => { setChildName(t); setError(''); }}
              placeholder="Ej. Sofía"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
          <Pressable style={({ pressed }) => [s.primary, pressed && { transform: [{ scale: 0.97 }] }]} onPress={handleNamesNext}>
            <Text style={s.primaryText}>Siguiente →</Text>
          </Pressable>
        </KeyboardAvoidingView>
      )}

      {step === 'create' && (
        <View style={s.padSection}>
          <Text style={s.padTitle}>Crea tu PIN</Text>
          <Text style={s.padSub}>4 dígitos secretos para padres</Text>
          <PinPad onComplete={handleCreate} errorMsg={error} />
        </View>
      )}

      {step === 'confirm' && (
        <View style={s.padSection}>
          <Text style={s.padTitle}>Confirma tu PIN</Text>
          <Text style={s.padSub}>Ingresa el mismo PIN otra vez</Text>
          <PinPad onComplete={handleConfirm} />
        </View>
      )}

      {step === 'email' && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.emailStep}>
          <Text style={s.padTitle}>Correo de recuperación</Text>
          <Text style={s.padSub}>Si olvidas tu PIN, lo restableceremos aquí</Text>
          {error ? <Text style={s.error}>{error}</Text> : null}
          <TextInput
            style={s.input}
            value={email}
            onChangeText={t => { setEmail(t); setError(''); }}
            placeholder="tu@correo.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable style={({ pressed }) => [s.primary, pressed && { transform: [{ scale: 0.97 }] }]} onPress={handleSave}>
            <Text style={s.primaryText}>¡Listo! Entrar →</Text>
          </Pressable>
        </KeyboardAvoidingView>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: C.bg, alignItems: 'center', paddingTop: 80, paddingHorizontal: 24, paddingBottom: 40 },
  brand: { alignItems: 'center', marginBottom: 48 },
  coinImg: { width: 96, height: 96, marginBottom: 12 },
  appName: { fontSize: 28, fontWeight: '900', color: C.text, letterSpacing: -0.5 },
  tagline: { fontSize: 14, fontWeight: '500', color: C.muted, marginTop: 4 },
  card: { width: '100%', backgroundColor: C.cardBg, borderRadius: C.rxl, padding: 24, gap: 16 },
  cardTitle: { fontSize: 22, fontWeight: '800', color: C.text },
  cardText: { fontSize: 15, fontWeight: '500', color: C.textMid, lineHeight: 23 },
  primary: {
    padding: 16, borderRadius: C.rlg, backgroundColor: C.pink, alignItems: 'center',
    shadowColor: C.pink, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  primaryText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  padSection: { width: '100%', alignItems: 'center' },
  nameStep:  { width: '100%', gap: 16 },
  emailStep: { width: '100%', alignItems: 'center', gap: 0 },
  padTitle: { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 6, textAlign: 'center' },
  padSub: { fontSize: 14, fontWeight: '500', color: C.muted, textAlign: 'center', marginBottom: 8 },
  error: { fontSize: 13, fontWeight: '600', color: C.pink, marginBottom: 4, textAlign: 'center' },
  nameField: { gap: 6 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  input: {
    width: '100%', padding: 16, borderRadius: C.rmd, borderWidth: 2, borderColor: C.border,
    fontSize: 16, fontWeight: '600', color: C.text, backgroundColor: C.cardBg, marginBottom: 4,
  },
});
