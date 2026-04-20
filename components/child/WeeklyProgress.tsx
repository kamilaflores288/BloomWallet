import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { C } from '@/constants/colors';

interface Props {
  current: number;
  limit: number;
}

const MESSAGES = [
  { threshold: 1,    msg: '¡Empieza tu semana! Completa tu primera tarea 💪' },
  { threshold: 0.25, msg: '¡Buen comienzo! Sigue así 🌱' },
  { threshold: 0.5,  msg: '¡Ya vas a la mitad! Eres increíble 🌿' },
  { threshold: 0.75, msg: '¡Casi llegas! Un último esfuerzo 🌺' },
  { threshold: 0.99, msg: '¡Meta completada! Eres una estrella 🌸' },
];

export function WeeklyProgressChild({ current, limit }: Props) {
  const pct = limit > 0 ? Math.min(current / limit, 1) : 0;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 900, delay: 200, useNativeDriver: false }).start();
  }, [pct]);

  const msg = MESSAGES.find(m => pct < m.threshold)?.msg ?? MESSAGES[MESSAGES.length - 1].msg;

  return (
    <View style={s.card}>
      <View style={s.top}>
        <Text style={s.title}>Esta semana</Text>
        <View style={s.countRow}>
          <Text style={s.count}>{current}</Text>
          <Text style={s.limit}>/{limit}</Text>
          <Image source={require('@/placeholders/bloom_coin.PNG')} style={s.coinIcon} resizeMode="contain" />
        </View>
      </View>
      <View style={s.track}>
        <Animated.View style={[s.fill, { width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
      </View>
      <Text style={s.msg}>{msg}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: C.pinkLight, borderRadius: C.rlg, padding: 16, marginBottom: 14 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 14, fontWeight: '700', color: C.text },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  count: { fontSize: 16, fontWeight: '900', color: C.pink },
  limit: { fontSize: 13, fontWeight: '600', color: C.muted },
  coinIcon: { width: 32, height: 32 },
  track: { height: 10, backgroundColor: 'rgba(240,68,122,0.15)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 },
  fill: { height: '100%', borderRadius: 10, backgroundColor: C.pink },
  msg: { fontSize: 12, fontWeight: '600', color: C.pink },
});
