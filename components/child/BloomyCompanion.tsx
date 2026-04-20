import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { bloomyStage } from '@/context/AppDataContext';

interface Props {
  weeklyEarned: number;
  weekLimit: number;
  streak: number;
  profileColor?: string;
}

export function BloomyCompanion({ weeklyEarned, weekLimit, streak, profileColor = '#F0447A' }: Props) {
  const stage  = bloomyStage(weeklyEarned, weekLimit);
  const bounce = useRef(new Animated.Value(0)).current;
  const glow   = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -8, duration: 900, useNativeDriver: true }),
        Animated.timing(bounce, { toValue:  0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1,   duration: 1200, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0.7, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const toNext = stage.nextPct !== null
    ? Math.max(0, Math.ceil((stage.nextPct / 100) * weekLimit) - weeklyEarned)
    : 0;

  return (
    <View style={s.container}>
      <Animated.View style={[s.glowRing, { opacity: glow, backgroundColor: profileColor + '33' }]} />
      <Animated.View style={[s.body, { transform: [{ translateY: bounce }] }]}>
        <Image source={stage.image} style={s.stageImage} resizeMode="contain" />
      </Animated.View>
      <View style={s.info}>
        <Text style={s.stageName}>{stage.name}</Text>
        {stage.nextPct !== null ? (
          <Text style={s.toNext}>{toNext} Blooms para evolucionar ✨</Text>
        ) : (
          <Text style={s.toNext}>¡Nivel máximo! 🌟</Text>
        )}
        {streak > 0 && (
          <View style={[s.streak, { backgroundColor: profileColor + '22' }]}>
            <Text style={[s.streakText, { color: profileColor }]}>🔥 {streak} día{streak > 1 ? 's' : ''} seguido{streak > 1 ? 's' : ''}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 8 },
  glowRing: {
    position: 'absolute',
    width: 100, height: 100,
    borderRadius: 50,
    top: 0,
  },
  body: { zIndex: 1 },
  stageImage: { width: 108, height: 108, backgroundColor: 'transparent' },
  info: { alignItems: 'center', marginTop: 8, gap: 4 },
  stageName: { fontSize: 16, fontWeight: '800', color: '#1A1A2E' },
  toNext: { fontSize: 12, fontWeight: '500', color: '#999999' },
  streak: {
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 20, marginTop: 4,
  },
  streakText: { fontSize: 12, fontWeight: '700' },
});
