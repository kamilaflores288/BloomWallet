import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { C } from '@/constants/colors';
import { HistoryEntry } from '@/types';

const BIG_ICONS: Record<string, string> = { earned: '⭐', spent: '🎁', redeemed: '🎁' };

interface Props { entries: HistoryEntry[] }

export function ChildHistoryList({ entries }: Props) {
  if (entries.length === 0) return null;

  const fmt = (iso: string) => {
    const d = new Date(iso);
    const isToday = d.toDateString() === new Date().toDateString();
    return isToday ? 'Hoy' : 'Ayer';
  };

  return (
    <View style={s.section}>
      <Text style={s.label}>Mis movimientos</Text>
      <View style={s.list}>
        {entries.slice(0, 6).map(e => (
          <View key={e.id} style={s.row}>
            <View style={[s.iconWrap, { backgroundColor: e.amount > 0 ? C.greenLight : C.pinkLight }]}>
              <Text style={s.icon}>{BIG_ICONS[e.type]}</Text>
            </View>
            <View style={s.info}>
              <Text style={s.name}>{e.description}</Text>
              <Text style={s.date}>{fmt(e.date)}</Text>
            </View>
            <View style={s.amountRow}>
              <Text style={[s.amount, e.amount > 0 ? s.pos : s.neg]}>
                {e.amount > 0 ? `+${e.amount}` : `−${Math.abs(e.amount)}`}
              </Text>
              <Image source={require('@/placeholders/bloom_coin.PNG')} style={s.coinIcon} resizeMode="contain" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  section: { marginBottom: 14 },
  label: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 10 },
  list: { gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.cardBg, borderRadius: C.rmd, padding: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: C.rmd, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: C.text },
  date: { fontSize: 11, fontWeight: '500', color: C.muted, marginTop: 2 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amount: { fontSize: 15, fontWeight: '800' },
  coinIcon: { width: 32, height: 32 },
  pos: { color: C.green },
  neg: { color: C.pink },
});
