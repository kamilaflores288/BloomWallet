import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { C } from '@/constants/colors';
import { PendingTask } from '@/types';

interface Props { tasks: PendingTask[] }

export function PendingSection({ tasks }: Props) {
  if (tasks.length === 0) return null;

  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.icon}>⏳</Text>
        <View>
          <Text style={s.title}>Esperando aprobación</Text>
          <Text style={s.sub}>Tu mamá/papá revisará tus tareas</Text>
        </View>
        <View style={s.badge}><Text style={s.badgeText}>{tasks.length}</Text></View>
      </View>
      <View style={s.list}>
        {tasks.map(t => (
          <View key={t.id} style={s.row}>
            <Text style={s.taskEmoji}>{t.taskEmoji}</Text>
            <Text style={s.taskName}>{t.taskName}</Text>
            <View style={s.bloomsRow}>
              <Text style={s.taskBlooms}>+{t.blooms}</Text>
              <Image source={require('@/placeholders/bloom_coin.PNG')} style={s.coinIcon} resizeMode="contain" />
            </View>
          </View>
        ))}
      </View>
      <Text style={s.note}>¡Tus Blooms llegarán cuando sean aprobadas! 💛</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: C.yellowLight,
    borderRadius: C.rlg,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(245,166,35,0.25)',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  icon: { fontSize: 24 },
  title: { fontSize: 14, fontWeight: '800', color: C.text },
  sub: { fontSize: 11, fontWeight: '500', color: C.muted, marginTop: 1 },
  badge: {
    marginLeft: 'auto',
    backgroundColor: C.yellow,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  list: { gap: 8, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: C.rsm, padding: 10 },
  taskEmoji: { fontSize: 18 },
  taskName: { flex: 1, fontSize: 13, fontWeight: '600', color: C.text },
  bloomsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  taskBlooms: { fontSize: 13, fontWeight: '700', color: '#7A5500' },
  coinIcon: { width: 28, height: 28 },
  note: { fontSize: 11, fontWeight: '600', color: '#7A5500', textAlign: 'center' },
});
