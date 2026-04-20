import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { C } from '@/constants/colors';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { HistoryEntry, Goal } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  earned: number;
  spent: number;
  saved: number;
  history: HistoryEntry[];
  goals: Goal[];
}

export function StatsSheet({ visible, onClose, earned, spent, saved, history, goals }: Props) {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    const isToday = d.toDateString() === new Date().toDateString();
    return `${isToday ? 'Hoy' : 'Ayer'} · ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  };

  const totalGoalCost = goals.reduce((sum, g) => sum + g.bloomCost, 0);
  const needsCost     = goals.filter(g => g.type === 'need').reduce((sum, g) => sum + g.bloomCost, 0);
  const wantsCost     = goals.filter(g => g.type === 'wish').reduce((sum, g) => sum + g.bloomCost, 0);

  const needsPct = totalGoalCost > 0 ? Math.round((needsCost / totalGoalCost) * 100) : 0;
  const wantsPct = totalGoalCost > 0 ? 100 - needsPct : 0;

  const hasGoals = goals.length > 0;

  return (
    <BottomSheet visible={visible} onClose={onClose} title="📊 Estadísticas">
      <View style={s.body}>
        <View style={s.row3}>
          {[{ val: earned, key: 'Ganados' }, { val: spent, key: 'Gastados' }, { val: saved, key: 'Ahorrados' }].map(item => (
            <View key={item.key} style={s.mini}>
              <Text style={s.miniVal}>{item.val}</Text>
              <Text style={s.miniKey}>{item.key}</Text>
            </View>
          ))}
        </View>

        <View>
          <Text style={s.distLabel}>Metas: Necesidades vs Deseos</Text>
          {hasGoals ? (
            <>
              <View style={s.distBar}>
                <View style={[s.need, { width: `${needsPct}%` }]} />
                <View style={[s.want, { flex: 1 }]} />
              </View>
              <View style={s.legend}>
                <Text style={s.legItem}><Text style={{ color: C.green }}>● </Text>Necesidades {needsPct}%</Text>
                <Text style={s.legItem}><Text style={{ color: C.purple }}>● </Text>Deseos {wantsPct}%</Text>
              </View>
              <View style={s.goalBreakdown}>
                <View style={[s.breakItem, { backgroundColor: C.greenLight }]}>
                  <Text style={s.breakVal}>{needsCost}</Text>
                  <Text style={[s.breakKey, { color: C.green }]}>Blooms en necesidades</Text>
                </View>
                <View style={[s.breakItem, { backgroundColor: C.purpleLight }]}>
                  <Text style={s.breakVal}>{wantsCost}</Text>
                  <Text style={[s.breakKey, { color: C.purple }]}>Blooms en deseos</Text>
                </View>
              </View>
            </>
          ) : (
            <View style={s.noGoals}>
              <Text style={s.noGoalsText}>Aún no hay metas creadas.</Text>
            </View>
          )}
        </View>

        <View>
          <Text style={s.distLabel}>Historial reciente</Text>
          {history.length === 0 ? (
            <View style={s.noGoals}>
              <Text style={s.noGoalsText}>No hay movimientos todavía.</Text>
            </View>
          ) : (
            <View style={s.histList}>
              {history.slice(0, 5).map(h => (
                <View key={h.id} style={s.histRow}>
                  <Text style={s.histIcon}>{h.amount > 0 ? '✅' : '🎁'}</Text>
                  <View style={s.histInfo}>
                    <Text style={s.histName}>{h.description}</Text>
                    <Text style={s.histDate}>{fmt(h.date)}</Text>
                  </View>
                  <View style={s.histAmtRow}>
                    <Text style={[s.histAmt, h.amount > 0 ? s.pos : s.neg]}>
                      {h.amount > 0 ? `+${h.amount}` : h.amount}
                    </Text>
                    <Image source={require('@/placeholders/bloom_coin.PNG')} style={s.coinIcon} resizeMode="contain" />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  body: { padding: 14, gap: 16 },
  row3: { flexDirection: 'row', gap: 10 },
  mini: { flex: 1, backgroundColor: C.cardBg, borderRadius: C.rmd, padding: 14, alignItems: 'center' },
  miniVal: { fontSize: 22, fontWeight: '900', color: C.text },
  miniKey: { fontSize: 11, fontWeight: '600', color: C.muted, marginTop: 2 },
  distLabel: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 8 },
  distBar: { height: 10, borderRadius: 10, flexDirection: 'row', overflow: 'hidden', marginBottom: 7, backgroundColor: C.purpleLight },
  need: { height: '100%', backgroundColor: C.green },
  want: { height: '100%', backgroundColor: C.purple },
  legend: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  legItem: { fontSize: 12, fontWeight: '600', color: C.textMid },
  goalBreakdown: { flexDirection: 'row', gap: 10 },
  breakItem: { flex: 1, borderRadius: C.rsm, padding: 12, alignItems: 'center', gap: 2 },
  breakVal: { fontSize: 18, fontWeight: '900', color: C.text },
  breakKey: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  noGoals: { backgroundColor: C.cardBg, borderRadius: C.rsm, padding: 14, alignItems: 'center' },
  noGoalsText: { fontSize: 13, fontWeight: '500', color: C.muted },
  histList: { gap: 8 },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.cardBg, borderRadius: C.rsm, padding: 11 },
  histIcon: { fontSize: 18, width: 26, textAlign: 'center' },
  histInfo: { flex: 1 },
  histName: { fontSize: 13, fontWeight: '700', color: C.text },
  histDate: { fontSize: 11, color: C.muted, marginTop: 1 },
  histAmtRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  histAmt: { fontSize: 14, fontWeight: '800' },
  coinIcon: { width: 32, height: 32 },
  pos: { color: C.green },
  neg: { color: C.pink },
});
