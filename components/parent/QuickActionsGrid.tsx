import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { C } from '@/constants/colors';

export interface QuickAction {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  bg: string;
  badge?: number;
}

interface Props {
  actions: QuickAction[];
  onPress: (id: string) => void;
}

export function QuickActionsGrid({ actions, onPress }: Props) {
  return (
    <>
      <Text style={s.label}>Accesos rápidos</Text>
      <View style={s.grid}>
        {actions.map(a => (
          <Pressable
            key={a.id}
            style={({ pressed }) => [s.card, { backgroundColor: a.bg }, pressed && s.pressed]}
            onPress={() => onPress(a.id)}
          >
            <View style={s.top}>
              <Text style={s.emoji}>{a.emoji}</Text>
              {!!a.badge && a.badge > 0 && (
                <View style={s.badge}><Text style={s.badgeText}>{a.badge}</Text></View>
              )}
            </View>
            <View>
              <Text style={s.name}>{a.name}</Text>
              <Text style={s.desc}>{a.desc}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </>
  );
}

const s = StyleSheet.create({
  label: { fontSize: 16, fontWeight: '800', color: C.text, marginHorizontal: 16, marginBottom: 10 },
  grid: { marginHorizontal: 16, marginBottom: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '47.5%', borderRadius: C.rlg, padding: 16, minHeight: 110, justifyContent: 'space-between' },
  pressed: { transform: [{ scale: 0.96 }], opacity: 0.9 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  emoji: { fontSize: 28 },
  badge: {
    backgroundColor: C.pink, minWidth: 22, height: 22,
    borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  badgeText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  name: { fontSize: 13, fontWeight: '800', color: C.text, lineHeight: 18 },
  desc: { fontSize: 11, fontWeight: '500', color: C.muted, marginTop: 2 },
});
