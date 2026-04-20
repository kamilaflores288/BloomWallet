import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { C } from '@/constants/colors';

interface Props {
  current: number;
  limit: number;
  childName: string;
}

export function WeeklyProgress({ current, limit, childName }: Props) {
  const pct = Math.min(current / limit, 1);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 1000, delay: 300, useNativeDriver: false }).start();
  }, [pct]);

  return (
    <View style={s.card}>
      <View style={s.top}>
        <Text style={s.title}>Progreso semanal</Text>
        <Text style={s.count}>{current}/{limit}</Text>
      </View>
      <View style={s.track}>
        <Animated.View
          style={[s.fill, { backgroundColor: pct > 0.85 ? C.yellow : C.green, width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
        />
      </View>
      <Text style={s.sub}>{childName} va muy bien · <Text style={s.bold}>{limit - current} Blooms restantes</Text></Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 14, backgroundColor: C.cardBg, borderRadius: C.rxl, padding: 16 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 15, fontWeight: '700', color: C.text },
  count: { fontSize: 15, fontWeight: '800', color: C.text },
  track: { height: 12, backgroundColor: '#E0D8D8', borderRadius: 10, overflow: 'hidden', marginBottom: 8 },
  fill: { height: '100%', borderRadius: 10 },
  sub: { fontSize: 13, fontWeight: '500', color: C.muted },
  bold: { fontWeight: '700', color: C.text },
});
