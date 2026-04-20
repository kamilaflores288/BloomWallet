import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Image } from 'react-native';
import { C } from '@/constants/colors';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { PendingTask } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  tasks: PendingTask[];
  onApprove: (id: string) => void;
  onReject:  (id: string) => void;
}

export function ApproveTasksSheet({ visible, onClose, tasks, onApprove, onReject }: Props) {
  const anims = useRef<Record<string, Animated.Value>>({});

  const getAnim = (id: string) => {
    if (!anims.current[id]) anims.current[id] = new Animated.Value(1);
    return anims.current[id];
  };

  const resolve = (id: string, approve: boolean) => {
    const anim = getAnim(id);
    Animated.timing(anim, { toValue: 0, duration: 260, useNativeDriver: true }).start(() => {
      delete anims.current[id];
      approve ? onApprove(id) : onReject(id);
    });
  };

  const fmt = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    return `${isToday ? 'Hoy' : 'Ayer'} · ${h}:${m}`;
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="📋 Aprobar tareas">
      <View style={s.list}>
        {tasks.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>🎉</Text>
            <Text style={s.emptyText}>¡Todo al día! Sin tareas pendientes.</Text>
          </View>
        ) : (
          tasks.map(t => (
            <Animated.View key={t.id} style={[s.row, { opacity: getAnim(t.id) }]}>
              <Text style={s.emoji}>{t.taskEmoji}</Text>
              <View style={s.info}>
                <Text style={s.name}>{t.taskName}</Text>
                <Text style={s.meta}>{fmt(t.completedAt)}</Text>
              </View>
              <View style={s.bloomsRow}>
                <Text style={s.blooms}>{t.blooms}</Text>
                <Image source={require('@/placeholders/bloom_coin.PNG')} style={s.coinIcon} resizeMode="contain" />
              </View>
              <View style={s.btns}>
                <Pressable style={({ pressed }) => [s.approve, pressed && s.btnPressed]} onPress={() => resolve(t.id, true)}>
                  <Text style={s.approveText}>✓</Text>
                </Pressable>
                <Pressable style={({ pressed }) => [s.reject, pressed && s.btnPressed]} onPress={() => resolve(t.id, false)}>
                  <Text style={s.rejectText}>✕</Text>
                </Pressable>
              </View>
            </Animated.View>
          ))
        )}
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  list: { padding: 12, gap: 10 },
  row: { backgroundColor: C.cardBg, borderRadius: C.rmd, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  emoji: { fontSize: 22 },
  info: { flex: 1 },
  name: { fontSize: 14, fontWeight: '700', color: C.text },
  meta: { fontSize: 12, color: C.muted, marginTop: 2 },
  bloomsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  blooms: { fontSize: 15, fontWeight: '800', color: C.text },
  coinIcon: { width: 36, height: 36 },
  btns: { flexDirection: 'row', gap: 7 },
  approve: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: C.rsm, backgroundColor: C.greenLight },
  reject:  { paddingHorizontal: 14, paddingVertical: 8, borderRadius: C.rsm, backgroundColor: C.pinkLight },
  btnPressed: { transform: [{ scale: 0.93 }] },
  approveText: { fontSize: 14, fontWeight: '700', color: C.green },
  rejectText:  { fontSize: 14, fontWeight: '700', color: C.pink },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 44, marginBottom: 10 },
  emptyText: { fontSize: 15, fontWeight: '700', color: C.muted },
});
