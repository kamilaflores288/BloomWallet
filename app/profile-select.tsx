import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '@/constants/colors';
import { PinPad } from '@/components/shared/PinPad';
import { pinStorage } from '@/hooks/usePin';
import { useAppData } from '@/context/AppDataContext';

export default function ProfileSelect() {
  const router = useRouter();
  const { data } = useAppData();
  const [pinVisible,    setPinVisible]    = useState(false);
  const [forgotVisible, setForgotVisible] = useState(false);
  const [pinError,      setPinError]      = useState('');
  const [maskedEmail,   setMaskedEmail]   = useState('');

  const handleParent = () => { setPinError(''); setPinVisible(true); };
  const handleChild  = () => router.replace('/(child)');

  const handlePin = async (pin: string) => {
    const ok = await pinStorage.verify(pin);
    if (ok) { setPinVisible(false); router.replace('/(parent)'); }
    else setPinError('PIN incorrecto. Intenta de nuevo.');
  };

  const handleForgot = async () => {
    const email = await pinStorage.getEmail();
    if (email) {
      const parts = email.split('@');
      setMaskedEmail(`${parts[0].slice(0,2)}****@${parts[1]}`);
    }
    setPinVisible(false);
    setForgotVisible(true);
  };

  const handleReset = () => {
    Alert.alert('Restablecer PIN', '¿Seguro? Deberás crear un PIN nuevo.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Restablecer', style: 'destructive', onPress: async () => {
        await pinStorage.reset();
        setForgotVisible(false);
        router.replace('/onboarding');
      }},
    ]);
  };

  const childName  = data.config.childName  || 'Niño/a';
  const parentName = data.config.parentName || 'Padre/Madre';

  return (
    <View style={s.container}>
      {/* Soft gradient simulation: baby yellow top → baby pink bottom */}
      <View style={s.gradTop} />
      <View style={s.gradBottom} />

      <Text style={s.title}>¿Quién eres?</Text>

      <View style={s.profiles}>
        <Pressable style={({ pressed }) => [s.card, pressed && s.cardPressed]} onPress={handleChild}>
          <View style={[s.avatar, { backgroundColor: '#FFE4EF' }]}>
            <Text style={s.avatarEmoji}>🌸</Text>
          </View>
          <Text style={s.profileName}>{childName}</Text>
          <Text style={s.profileRole}>Niño/a</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [s.card, pressed && s.cardPressed]} onPress={handleParent}>
          <View style={[s.avatar, { backgroundColor: '#EDE5FF' }]}>
            <Text style={s.avatarEmoji}>👩</Text>
            <View style={s.lockBadge}><Text style={{ fontSize: 13 }}>🔒</Text></View>
          </View>
          <Text style={s.profileName}>{parentName}</Text>
          <Text style={s.profileRole}>Padre/Madre</Text>
        </Pressable>
      </View>

      {/* PIN Modal */}
      <Modal visible={pinVisible} transparent animationType="fade" onRequestClose={() => setPinVisible(false)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>Perfil de Padres 🔒</Text>
            <Text style={s.sheetSub}>Ingresa tu PIN de 4 dígitos</Text>
            <PinPad onComplete={handlePin} onForgot={handleForgot} errorMsg={pinError} />
            <Pressable style={s.cancelBtn} onPress={() => { setPinVisible(false); setPinError(''); }}>
              <Text style={s.cancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Forgot PIN Modal */}
      <Modal visible={forgotVisible} transparent animationType="fade" onRequestClose={() => setForgotVisible(false)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>¿Olvidaste tu PIN?</Text>
            {maskedEmail ? <Text style={s.sheetSub}>Correo registrado: {maskedEmail}</Text> : null}
            <Text style={s.resetInfo}>Al restablecer, deberás crear un nuevo PIN.</Text>
            <Pressable style={s.resetBtn} onPress={handleReset}>
              <Text style={s.resetBtnText}>Restablecer PIN</Text>
            </Pressable>
            <Pressable style={s.cancelBtn} onPress={() => setForgotVisible(false)}>
              <Text style={s.cancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF6', alignItems: 'center', justifyContent: 'center' },

  gradTop: {
    position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
    backgroundColor: '#FFF8DC', opacity: 0.65,
  },
  gradBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%',
    backgroundColor: '#FFE4F0', opacity: 0.4,
  },

  title: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 52, letterSpacing: -0.5 },
  profiles: { flexDirection: 'row', gap: 28 },
  card: { alignItems: 'center', gap: 10 },
  cardPressed: { transform: [{ scale: 0.96 }] },
  avatar: {
    width: 104, height: 104, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4,
  },
  avatarEmoji: { fontSize: 48 },
  lockBadge: {
    position: 'absolute', bottom: -6, right: -6,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FFFBF6',
    alignItems: 'center', justifyContent: 'center',
  },
  profileName: { fontSize: 16, fontWeight: '700', color: C.text },
  profileRole: { fontSize: 12, fontWeight: '500', color: C.muted },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  sheet: { backgroundColor: C.bg, borderRadius: C.rxl, padding: 28, width: '100%', maxWidth: 360, alignItems: 'center' },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 6 },
  sheetSub: { fontSize: 14, fontWeight: '500', color: C.muted, marginBottom: 8, textAlign: 'center' },
  resetInfo: { fontSize: 13, fontWeight: '500', color: C.muted, textAlign: 'center', marginBottom: 20 },
  resetBtn: { width: '100%', padding: 15, borderRadius: C.rlg, backgroundColor: C.pink, alignItems: 'center', marginBottom: 8 },
  resetBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  cancelBtn: { padding: 12 },
  cancelText: { fontSize: 15, fontWeight: '600', color: C.muted },
});
