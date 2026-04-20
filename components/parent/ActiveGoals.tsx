import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { C } from '@/constants/colors';
import { Goal } from '@/types';

const META: Record<string, { bg: string; bar: string; tagBg: string; tagColor: string; tagLabel: string }> = {
  wish: { bg: C.purpleLight, bar: C.purple, tagBg: C.purpleLight, tagColor: C.purple, tagLabel: '✨ Wish' },
  need: { bg: C.greenLight,  bar: C.green,  tagBg: C.greenLight,  tagColor: C.green,  tagLabel: '🌱 Need' },
};

interface Props { goals: Goal[] }

export function ActiveGoals({ goals }: Props) {
  return (
    <>
      <Text style={s.label}>Metas activas</Text>
      <View style={s.list}>
        {goals.map(g => {
          const pct = Math.round((g.currentBlooms / g.bloomCost) * 100);
          const m = g.redeemed
            ? { bg: C.yellowLight, bar: C.yellow, tagBg: C.yellowLight, tagColor: C.yellow, tagLabel: '🌟 Completada' }
            : META[g.type];
          return (
            <View key={g.id} style={s.card}>
              <View style={s.top}>
                <View style={[s.iconBox, { backgroundColor: m.bg }]}>
                  <Text style={s.iconEmoji}>{g.emoji}</Text>
                </View>
                <View style={s.info}>
                  <Text style={s.name}>{g.name}</Text>
                  <View style={[s.tag, { backgroundColor: m.tagBg }]}>
                    <Text style={[s.tagText, { color: m.tagColor }]}>{m.tagLabel}</Text>
                  </View>
                </View>
                <View style={s.right}>
                  <View style={s.bloomsRow}>
                    <Text style={s.bloomsNum}>{g.bloomCost}</Text>
                    <Image source={require('@/placeholders/bloom_coin.PNG')} style={s.coinImg} resizeMode="contain" />
                  </View>
                  <Text style={s.mxn}>= ${(g.bloomCost * 5.6).toFixed(0)} mxn</Text>
                </View>
              </View>
              <View style={s.barRow}>
                <View style={s.track}>
                  <View style={[s.fill, { backgroundColor: m.bar, width: `${Math.min(pct, 100)}%` }]} />
                </View>
                <Text style={[s.pct, { color: m.bar }]}>{pct}%</Text>
              </View>
              <Text style={s.progText}>{g.currentBlooms} / {g.bloomCost} Blooms · {pct}%</Text>
            </View>
          );
        })}
      </View>
    </>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 16, fontWeight: '800', color: C.text, marginHorizontal: 16, marginBottom: 10 },
  list: { marginHorizontal: 16, marginBottom: 14, gap: 10 },
  card: { backgroundColor: C.cardBg, borderRadius: C.rlg, padding: 14, gap: 8 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: { width: 44, height: 44, borderRadius: C.rmd, alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 22 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '800', color: C.text },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 2, borderRadius: 20, marginTop: 3 },
  tagText: { fontSize: 11, fontWeight: '700' },
  right: { alignItems: 'flex-end' },
  bloomsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  bloomsNum: { fontSize: 18, fontWeight: '900', color: C.text },
  coinImg: { width: 28, height: 28 },
  mxn: { fontSize: 11, color: C.muted, fontWeight: '500', marginTop: 1 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { flex: 1, height: 8, backgroundColor: '#E0D8D8', borderRadius: 8, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 8 },
  pct: { fontSize: 12, fontWeight: '800', minWidth: 32, textAlign: 'right' },
  progText: { fontSize: 12, fontWeight: '600', color: C.muted },
});
