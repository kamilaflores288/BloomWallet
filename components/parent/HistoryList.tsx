import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '@/constants/colors';
import { HistoryEntry } from '@/types';

const ICONS: Record<string, string> = { earned: '💰', spent: '🎁', redeemed: '🎁' };

interface Props { entries: HistoryEntry[] }

export function HistoryList({ entries }: Props) {
  return (
    <View style={s.section}>
      <Text style={s.label}>Historial</Text>
      <View style={s.card}>
        {entries.slice(0, 8).map((e, idx) => (
          <View key={e.id} style={[s.row, idx < Math.min(entries.length, 8) - 1 && s.border]}>
            <Text style={s.icon}>{ICONS[e.type] ?? '💰'}</Text>
            <Text style={s.name}>{e.description}</Text>
            <Text style={[s.amount, e.amount > 0 ? s.pos : s.neg]}>
              {e.amount > 0 ? `+${e.amount}` : `−${Math.abs(e.amount)}`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginHorizontal: 16, marginBottom: 14 },
  label: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 10 },
  card: { backgroundColor: C.cardBg, borderRadius: C.rlg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 },
  border: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  icon: { fontSize: 20, width: 28, textAlign: 'center' },
  name: { flex: 1, fontSize: 14, fontWeight: '600', color: C.text },
  amount: { fontSize: 15, fontWeight: '800' },
  pos: { color: C.green },
  neg: { color: C.pink },
});
