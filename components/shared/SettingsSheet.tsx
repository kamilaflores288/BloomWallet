import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { C, PROFILE_COLORS } from '@/constants/colors';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { Config } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  config: Config;
  onSave: (c: Partial<Config>) => void;
  onManagePin?: () => void;
  onSwitchProfile?: () => void;
}

export function SettingsSheet({ visible, onClose, config, onSave, onManagePin, onSwitchProfile }: Props) {
  const [parentName, setParentName] = useState(config.parentName);
  const [childName,  setChildName]  = useState(config.childName);
  const [color,      setColor]      = useState(config.profileColor ?? '#F0447A');

  useEffect(() => {
    setParentName(config.parentName);
    setChildName(config.childName);
    setColor(config.profileColor ?? '#F0447A');
  }, [config, visible]);

  const handleSave = () => {
    onSave({
      parentName:   parentName.trim() || config.parentName,
      childName:    childName.trim()  || config.childName,
      profileColor: color,
    });
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="⚙️ Configuración">
      <View style={s.body}>

        <View style={s.field}>
          <Text style={s.fieldLabel}>NOMBRE DEL PADRE/MADRE</Text>
          <TextInput
            style={s.input}
            value={parentName}
            onChangeText={setParentName}
            placeholder="Ej. Mamá Laura"
            autoCapitalize="words"
          />
        </View>

        <View style={s.field}>
          <Text style={s.fieldLabel}>NOMBRE DEL NIÑO/A</Text>
          <TextInput
            style={s.input}
            value={childName}
            onChangeText={setChildName}
            placeholder="Ej. Sofía"
            autoCapitalize="words"
          />
        </View>

        <View style={s.field}>
          <Text style={s.fieldLabel}>COLOR DE PERFIL</Text>
          <View style={s.colorRow}>
            {PROFILE_COLORS.map(pc => (
              <Pressable
                key={pc.id}
                style={[s.colorDot, { backgroundColor: pc.hex }, color === pc.hex && s.colorSel]}
                onPress={() => setColor(pc.hex)}
              />
            ))}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [s.saveBtn, { backgroundColor: color }, pressed && { transform: [{ scale: 0.97 }] }]}
          onPress={handleSave}
        >
          <Text style={s.saveBtnText}>Guardar cambios</Text>
        </Pressable>

        {(onManagePin || onSwitchProfile) && (
          <View style={s.extras}>
            {onManagePin && (
              <Pressable style={s.extraRow} onPress={() => { onClose(); onManagePin(); }}>
                <Text style={s.extraIcon}>🔐</Text>
                <Text style={s.extraText}>Gestionar PIN</Text>
                <Text style={s.arrow}>›</Text>
              </Pressable>
            )}
            {onSwitchProfile && (
              <Pressable style={s.extraRow} onPress={() => { onClose(); onSwitchProfile(); }}>
                <Text style={s.extraIcon}>👤</Text>
                <Text style={s.extraText}>Cambiar perfil</Text>
                <Text style={s.arrow}>›</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  body: { padding: 14, gap: 12 },
  field: { backgroundColor: C.cardBg, borderRadius: C.rmd, padding: 14, gap: 8 },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: C.bg, borderRadius: C.rsm, padding: 12,
    fontSize: 15, fontWeight: '600', color: C.text,
    borderWidth: 2, borderColor: C.border,
  },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorSel: { borderWidth: 3, borderColor: C.text, transform: [{ scale: 1.15 }] },
  saveBtn: {
    padding: 15, borderRadius: C.rlg, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4,
  },
  saveBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  extras: { backgroundColor: C.cardBg, borderRadius: C.rmd, overflow: 'hidden' },
  extraRow: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  extraIcon: { fontSize: 18 },
  extraText: { flex: 1, fontSize: 14, fontWeight: '600', color: C.text },
  arrow: { fontSize: 20, color: C.muted },
});
