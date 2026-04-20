import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { C } from '@/constants/colors';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { Config } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  config: Config;
  onSave: (c: Partial<Config>) => void;
}

export function EconomicConfigSheet({ visible, onClose, config, onSave }: Props) {
  const [bloomVal, setBloomVal] = useState(String(config.bloomValue));
  const [limit,    setLimit]    = useState(String(config.weekLimit));

  useEffect(() => {
    setBloomVal(String(config.bloomValue));
    setLimit(String(config.weekLimit));
  }, [config, visible]);

  const handleSave = () => {
    onSave({
      bloomValue: parseFloat(bloomVal) || config.bloomValue,
      weekLimit:  parseInt(limit)      || config.weekLimit,
    });
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="💱 Config. económica">
      <View style={s.body}>

        <View style={s.field}>
          <Text style={s.fieldLabel}>VALOR DE 1 BLOOM 🌸</Text>
          <View style={s.row}>
            <TextInput
              style={s.input}
              value={bloomVal}
              onChangeText={setBloomVal}
              keyboardType="decimal-pad"
            />
            <Text style={s.unit}>MXN por Bloom</Text>
          </View>
        </View>

        <View style={s.field}>
          <Text style={s.fieldLabel}>LÍMITE SEMANAL</Text>
          <View style={s.row}>
            <TextInput
              style={s.input}
              value={limit}
              onChangeText={setLimit}
              keyboardType="number-pad"
            />
            <Text style={s.unit}>Blooms / semana</Text>
          </View>
        </View>

        {[
          { name: 'Retos semanales', sub: 'Mini retos educativos' },
          { name: 'Insignias',       sub: 'Sistema de logros y medallas' },
        ].map(p => (
          <View key={p.name} style={s.premium}>
            <View style={s.premInfo}>
              <Text style={s.premName}>{p.name}</Text>
              <Text style={s.premSub}>{p.sub}</Text>
            </View>
            <View style={s.premBadge}><Text style={s.premBadgeText}>⭐ Premium</Text></View>
          </View>
        ))}

        <Pressable
          style={({ pressed }) => [s.saveBtn, pressed && { transform: [{ scale: 0.97 }] }]}
          onPress={handleSave}
        >
          <Text style={s.saveBtnText}>Guardar cambios</Text>
        </Pressable>

      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  body: { padding: 14, gap: 12 },
  field: { backgroundColor: C.cardBg, borderRadius: C.rmd, padding: 14, gap: 8 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1, padding: 10, borderRadius: C.rsm,
    borderWidth: 2, borderColor: C.border,
    fontSize: 16, fontWeight: '700', color: C.text, backgroundColor: C.bg,
  },
  unit: { fontSize: 13, fontWeight: '600', color: C.muted },
  premium: {
    backgroundColor: C.cardBg, borderRadius: C.rmd, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12, opacity: 0.55,
  },
  premInfo: { flex: 1 },
  premName: { fontSize: 14, fontWeight: '700', color: C.text },
  premSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  premBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: '#FFD040' },
  premBadgeText: { fontSize: 11, fontWeight: '700', color: '#7A4F00' },
  saveBtn: {
    padding: 15, borderRadius: C.rlg, alignItems: 'center',
    backgroundColor: C.pink,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
