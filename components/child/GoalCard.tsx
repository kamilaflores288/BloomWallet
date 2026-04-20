import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Alert, Image } from 'react-native';
import { C } from '@/constants/colors';
import { Goal } from '@/types';

interface Props {
  goal: Goal;
  userBlooms: number;
  onRedeem: (id: string) => void;
}

const TYPE_META = {
  wish: { bg: C.purpleLight, bar: C.purple, tagBg: C.purpleLight, tagColor: C.purple, tag: '✨ Deseo' },
  need: { bg: C.greenLight,  bar: C.green,  tagBg: C.greenLight,  tagColor: C.green,  tag: '🌱 Necesidad' },
};

export function GoalCard({ goal, userBlooms, onRedeem }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const isComplete = goal.redeemed || userBlooms >= goal.bloomCost;
  const pct = goal.redeemed
    ? 100
    : Math.min(Math.round((userBlooms / goal.bloomCost) * 100), 100);

  const m = goal.redeemed
    ? { bg: C.yellowLight, bar: C.yellow, tagBg: C.yellowLight, tagColor: C.yellow, tag: '🌟 Completada' }
    : TYPE_META[goal.type];

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 160, useNativeDriver: true }),
    ]).start();
    if (goal.redeemed) return;
    if (userBlooms < goal.bloomCost) {
      Alert.alert('Blooms insuficientes', `Necesitas ${goal.bloomCost - userBlooms} Blooms más.`);
      return;
    }
    Alert.alert('¿Canjear meta?', `Gastarás ${goal.bloomCost} Blooms en "${goal.name}"`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: '¡Canjear!', onPress: () => onRedeem(goal.id) },
    ]);
  };

  return (
    <Animated.View style={[s.card, { transform: [{ scale }] }]}>
      <View style={[s.iconBox, { backgroundColor: m.bg }]}>
        <Text style={s.emoji}>{goal.emoji}</Text>
        {goal.redeemed && <View style={s.redeemBadge}><Text style={{ fontSize: 14 }}>✅</Text></View>}
      </View>
      <Text style={s.name}>{goal.name}</Text>
      <View style={[s.tag, { backgroundColor: m.tagBg }]}>
        <Text style={[s.tagText, { color: m.tagColor }]}>{m.tag}</Text>
      </View>
      <View style={s.bloomRow}>
        <Text style={s.bloomNum}>{Math.min(userBlooms, goal.bloomCost)}</Text>
        <View style={s.bloomOfRow}>
          <Text style={s.bloomOf}>/{goal.bloomCost}</Text>
          <Image source={require('@/placeholders/bloom_coin.PNG')} style={s.coinIcon} resizeMode="contain" />
        </View>
      </View>
      <View style={s.track}>
        <View style={[s.fill, { backgroundColor: m.bar, width: `${pct}%` }]} />
      </View>
      <Text style={s.pct}>{pct}%</Text>
      {isComplete && !goal.redeemed && (
        <Pressable style={s.redeemBtn} onPress={handlePress}>
          <Text style={s.redeemText}>¡Canjear! 🎉</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: C.cardBg,
    borderRadius: C.rlg,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    marginRight: 12,
  },
  iconBox: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  emoji: { fontSize: 32 },
  redeemBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: C.bg, borderRadius: 10, padding: 1 },
  name: { fontSize: 13, fontWeight: '800', color: C.text, textAlign: 'center' },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  tagText: { fontSize: 10, fontWeight: '700' },
  bloomRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  bloomNum: { fontSize: 18, fontWeight: '900', color: C.text },
  bloomOfRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  bloomOf: { fontSize: 12, fontWeight: '600', color: C.muted },
  coinIcon: { width: 28, height: 28 },
  track: { width: '100%', height: 6, backgroundColor: '#E0D8D8', borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },
  pct: { fontSize: 11, fontWeight: '700', color: C.muted },
  redeemBtn: { backgroundColor: C.pink, paddingHorizontal: 14, paddingVertical: 8, borderRadius: C.rsm, marginTop: 4 },
  redeemText: { fontSize: 13, fontWeight: '800', color: '#fff' },
});
