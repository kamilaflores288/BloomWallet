import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { C } from '@/constants/colors';

interface Props {
  blooms: number;
  bloomValue: number;
  childName: string;
  parentName: string;
  earned: number;
  spent: number;
}

export function HeroCard({ blooms, bloomValue, childName, parentName, earned, spent }: Props) {
  return (
    <View style={s.card}>
      <Text style={s.greeting}>Hola, {parentName}! 👋</Text>
      <View style={s.bloomRow}>
        <Image source={require('@/placeholders/bloom_coin.PNG')} style={s.coinImg} resizeMode="contain" />
        <Text style={s.bloomNum}>{blooms} Blooms</Text>
      </View>
      <Text style={s.mxn}>= ${(blooms * bloomValue).toFixed(2)} MXN · {childName}</Text>
      <View style={s.stats}>
        <View style={s.statBox}>
          <Text style={s.statLabel}>💰 Ganados</Text>
          <Text style={[s.statVal, { color: C.green }]}>{earned}</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statLabel}>🎁 Gastados</Text>
          <Text style={[s.statVal, { color: C.pink }]}>{spent}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 14, backgroundColor: C.cardBg, borderRadius: C.rxl, padding: 18 },
  greeting: { fontSize: 18, fontWeight: '700', color: C.text, marginBottom: 4 },
  bloomRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  coinImg: { width: 44, height: 44 },
  bloomNum: { fontSize: 36, fontWeight: '900', color: C.text, letterSpacing: -1, lineHeight: 40 },
  mxn: { fontSize: 13, fontWeight: '500', color: C.muted, marginBottom: 14 },
  stats: { flexDirection: 'row', gap: 10 },
  statBox: { flex: 1, backgroundColor: C.bg, borderRadius: C.rmd, padding: 12, gap: 3 },
  statLabel: { fontSize: 11, fontWeight: '600', color: C.muted },
  statVal: { fontSize: 20, fontWeight: '800' },
});
