import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Image } from 'react-native';
import { C } from '@/constants/colors';
import { Task } from '@/types';

export type TaskState = 'idle' | 'pending' | 'completed';

const FREQ_LABELS: Record<string, string> = { daily: 'Diaria', weekly: 'Semanal' };

const STATE_CONFIG: Record<TaskState, { icon: string; bg: string; color: string }> = {
  idle:      { icon: '🚀', bg: 'transparent', color: 'transparent' },
  pending:   { icon: '⏳', bg: '#FFF4E0',      color: '#F5A623'     },
  completed: { icon: '✅', bg: '#E6F7F0',      color: '#4CAF82'     },
};

interface Props {
  task: Task;
  taskState: TaskState;
  cardColor: string;
  profileColor: string;
  onComplete: (id: string) => void;
}

export function TaskCard({ task, taskState, cardColor, profileColor, onComplete }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (taskState !== 'idle') return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 80,  useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 180, useNativeDriver: true }),
    ]).start();
    onComplete(task.id);
  };

  const cfg = STATE_CONFIG[taskState];

  return (
    <Animated.View style={[s.card, { backgroundColor: cardColor, transform: [{ scale }] }]}>
      <View style={s.top}>
        <View style={[s.iconBox, { backgroundColor: cardColor === '#FFFFFF' ? C.pinkLight : cardColor + 'CC' }]}>
          <Text style={s.emoji}>{task.emoji}</Text>
        </View>
        <View style={s.info}>
          <Text style={s.name}>{task.name}</Text>
          <Text style={s.freq}>{FREQ_LABELS[task.frequency] ?? task.frequency}</Text>
        </View>
        <View style={s.bloomSide}>
          <Text style={s.bloomNum}>{task.blooms}</Text>
          <Image source={require('@/placeholders/bloom_coin.PNG')} style={s.coinImg} resizeMode="contain" />
        </View>
      </View>

      <View style={s.btnRow}>
        {taskState === 'idle' ? (
          <Pressable
            style={[s.circleBtn, { backgroundColor: profileColor }]}
            onPress={handlePress}
          >
            <Text style={s.circleBtnIcon}>🚀</Text>
          </Pressable>
        ) : (
          <View style={[s.statusPill, { backgroundColor: cfg.bg, borderColor: cfg.color + '55', borderWidth: 1.5 }]}>
            <Text style={s.statusIcon}>{cfg.icon}</Text>
            <Text style={[s.statusText, { color: cfg.color }]}>
              {taskState === 'pending' ? 'Esperando aprobación' : 'Completada'}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: C.rlg,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  iconBox: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 26 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '800', color: C.text },
  freq: { fontSize: 12, fontWeight: '500', color: C.muted, marginTop: 2 },
  bloomSide: { alignItems: 'center', gap: 2 },
  bloomNum: { fontSize: 20, fontWeight: '900', color: C.text },
  coinImg: { width: 32, height: 32 },
  btnRow: { alignItems: 'center' },
  circleBtn: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  circleBtnIcon: { fontSize: 22 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
  },
  statusIcon: { fontSize: 16 },
  statusText: { fontSize: 13, fontWeight: '700' },
});
