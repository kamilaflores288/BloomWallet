import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { C } from '@/constants/colors';

interface Props {
  count: number;
  onPress: () => void;
}

export function PendingAlert({ count, onPress }: Props) {
  const blink = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count === 0) { blink.setValue(0); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(blink, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(blink, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [count]);

  return (
    <Pressable style={({ pressed }) => [s.alert, pressed && { opacity: 0.8 }]} onPress={onPress}>
      {count > 0 && <Animated.View style={[s.dot, { opacity: blink }]} />}
      <Text style={s.text}>
        {count > 0 ? `${count} tarea${count > 1 ? 's' : ''} esperan tu aprobación` : '¡Sin tareas pendientes! 🎉'}
      </Text>
      <Text style={s.arrow}>→</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  alert: {
    marginHorizontal: 16, marginBottom: 14,
    backgroundColor: C.yellowLight,
    borderRadius: C.rlg, padding: 13,
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1.5, borderColor: 'rgba(245,166,35,0.25)',
  },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.yellow },
  text: { flex: 1, fontSize: 13, fontWeight: '700', color: '#7A5500' },
  arrow: { fontSize: 14, fontWeight: '800', color: C.yellow },
});
