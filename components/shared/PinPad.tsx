import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { C } from '@/constants/colors';

interface Props {
  onComplete: (pin: string) => void;
  onForgot?: () => void;
  errorMsg?: string;
}

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export function PinPad({ onComplete, onForgot, errorMsg }: Props) {
  const [input, setInput] = useState('');

  const handleKey = (key: string) => {
    if (key === '') return;
    if (key === '⌫') { setInput(p => p.slice(0, -1)); return; }
    if (input.length >= 4) return;
    const next = input + key;
    setInput(next);
    if (next.length === 4) {
      setTimeout(() => { setInput(''); onComplete(next); }, 150);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.dots}>
        {[0,1,2,3].map(i => (
          <View key={i} style={[s.dot, i < input.length && s.dotFilled]} />
        ))}
      </View>
      {errorMsg ? <Text style={s.error}>{errorMsg}</Text> : null}
      <View style={s.grid}>
        {KEYS.map((key, idx) => (
          <Pressable
            key={idx}
            style={({ pressed }) => [s.key, key === '' && s.keyEmpty, pressed && key !== '' && s.keyPressed]}
            onPress={() => handleKey(key)}
            disabled={key === ''}
          >
            <Text style={[s.keyText, key === '⌫' && s.back]}>{key}</Text>
          </Pressable>
        ))}
      </View>
      {onForgot && (
        <Pressable onPress={onForgot} style={s.forgotBtn}>
          <Text style={s.forgotText}>¿Olvidaste tu PIN?</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { alignItems: 'center', width: '100%' },
  dots: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  dot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: C.pinkPill,
    backgroundColor: 'transparent',
  },
  dotFilled: { backgroundColor: C.pink, borderColor: C.pink },
  error: { fontSize: 13, fontWeight: '600', color: C.pink, marginBottom: 16, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 264, gap: 12, justifyContent: 'center', marginTop: 24 },
  key: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: C.cardBg,
    alignItems: 'center', justifyContent: 'center',
  },
  keyEmpty: { backgroundColor: 'transparent' },
  keyPressed: { backgroundColor: C.pinkLight },
  keyText: { fontSize: 24, fontWeight: '700', color: C.text },
  back: { fontSize: 20 },
  forgotBtn: { marginTop: 28, padding: 8 },
  forgotText: { fontSize: 14, fontWeight: '600', color: C.pink },
});
