import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, Alert, Image } from 'react-native';
import { C } from '@/constants/colors';
import { BottomSheet } from '@/components/shared/BottomSheet';
import { Task } from '@/types';

type Freq = 'daily' | 'weekly';

interface Props {
  visible: boolean;
  onClose: () => void;
  tasks: Task[];
  onAdd:    (task: Task) => void;
  onDelete: (id: string) => void;
  onUpdate: (task: Task) => void;
}

const FREQ_LABELS: Record<Freq, string> = { daily: 'Diaria', weekly: 'Semanal' };
const FREQ_OPTIONS: Freq[] = ['daily', 'weekly'];
const EMOJIS = ['⭐','🛏️','📚','🧹','🗑️','🍽️','🐾','🌿','🧺','🚿','🐕','🎒','🧼','🪴'];

type Mode = 'idle' | 'creating' | 'editing';

export function ManageTasksSheet({ visible, onClose, tasks, onAdd, onDelete, onUpdate }: Props) {
  const [mode,      setMode]      = useState<Mode>('idle');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name,   setName]   = useState('');
  const [emoji,  setEmoji]  = useState('⭐');
  const [blooms, setBlooms] = useState('10');
  const [freq,   setFreq]   = useState<Freq>('daily');

  const openCreate = () => {
    setName(''); setEmoji('⭐'); setBlooms('10'); setFreq('daily');
    setEditingId(null);
    setMode('creating');
  };

  const openEdit = (t: Task) => {
    setName(t.name); setEmoji(t.emoji); setBlooms(String(t.blooms)); setFreq(t.frequency as Freq);
    setEditingId(t.id);
    setMode('editing');
  };

  const cancel = () => { setMode('idle'); setEditingId(null); };

  const save = () => {
    if (!name.trim()) { Alert.alert('Falta el nombre'); return; }
    if (mode === 'creating') {
      onAdd({ id: `t${Date.now()}`, name: name.trim(), emoji, blooms: parseInt(blooms) || 10, frequency: freq });
    } else if (mode === 'editing' && editingId) {
      onUpdate({ id: editingId, name: name.trim(), emoji, blooms: parseInt(blooms) || 10, frequency: freq });
    }
    cancel();
  };

  const confirmDelete = (t: Task) => {
    Alert.alert('Eliminar tarea', `¿Eliminar "${t.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(t.id) },
    ]);
  };

  const isForm = mode === 'creating' || mode === 'editing';

  return (
    <BottomSheet visible={visible} onClose={onClose} title="⚙️ Gestionar tareas">

      {tasks.length === 0 && !isForm ? (
        <View style={s.empty}>
          <Text style={s.emptyIcon}>📋</Text>
          <Text style={s.emptyText}>Aún no hay tareas.</Text>
          <Text style={s.emptySub}>Crea la primera para que {'\n'}tu hijo/a pueda ganar Blooms.</Text>
        </View>
      ) : (
        <View style={s.list}>
          {tasks.map(t => (
            <View key={t.id} style={[s.taskRow, editingId === t.id && s.taskRowActive]}>
              <Text style={s.rowEmoji}>{t.emoji}</Text>
              <View style={s.info}>
                <Text style={s.taskName}>{t.name}</Text>
                <View style={s.taskSubRow}>
                  <Text style={s.taskSub}>{FREQ_LABELS[t.frequency as Freq]} · {t.blooms} Blooms</Text>
                  <Image source={require('@/placeholders/bloom_coin.PNG')} style={s.coinIcon} resizeMode="contain" />
                </View>
              </View>
              <Pressable style={s.iconBtn} onPress={() => openEdit(t)}>
                <Text style={s.iconBtnText}>✏️</Text>
              </Pressable>
              <Pressable style={s.iconBtn} onPress={() => confirmDelete(t)}>
                <Text style={s.iconBtnText}>🗑️</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {isForm && (
        <View style={s.form}>
          <Text style={s.formTitle}>{mode === 'creating' ? 'Nueva tarea' : 'Editar tarea'}</Text>
          <View style={s.emojiRow}>
            {EMOJIS.map(e => (
              <Pressable key={e} style={[s.emojiOpt, emoji === e && s.emojiSel]} onPress={() => setEmoji(e)}>
                <Text style={{ fontSize: 22 }}>{e}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="Nombre de la tarea"
            placeholderTextColor={C.muted}
          />
          <View style={s.row2}>
            <TextInput
              style={[s.input, { flex: 1 }]}
              value={blooms}
              onChangeText={setBlooms}
              keyboardType="number-pad"
              placeholder="Blooms"
              placeholderTextColor={C.muted}
            />
            <View style={s.freqRow}>
              {FREQ_OPTIONS.map(f => (
                <Pressable key={f} style={[s.freqBtn, freq === f && s.freqSel]} onPress={() => setFreq(f)}>
                  <Text style={[s.freqText, freq === f && s.freqTextSel]}>{FREQ_LABELS[f]}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={s.formBtns}>
            <Pressable style={s.cancelBtn} onPress={cancel}>
              <Text style={s.cancelText}>Cancelar</Text>
            </Pressable>
            <Pressable style={s.saveBtn} onPress={save}>
              <Text style={s.saveText}>Guardar</Text>
            </Pressable>
          </View>
        </View>
      )}

      {!isForm && (
        <Pressable style={s.addBtn} onPress={openCreate}>
          <Text style={s.addText}>+ Crear nueva tarea</Text>
        </Pressable>
      )}

    </BottomSheet>
  );
}

const s = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 16, gap: 6 },
  emptyIcon: { fontSize: 40, marginBottom: 4 },
  emptyText: { fontSize: 16, fontWeight: '800', color: C.text },
  emptySub: { fontSize: 13, fontWeight: '500', color: C.muted, textAlign: 'center', lineHeight: 20 },
  list: { padding: 12, gap: 8 },
  taskRow: {
    backgroundColor: C.cardBg, borderRadius: C.rmd, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  taskRowActive: { borderWidth: 1.5, borderColor: C.pink },
  rowEmoji: { fontSize: 22 },
  info: { flex: 1 },
  taskName: { fontSize: 14, fontWeight: '700', color: C.text },
  taskSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  taskSub: { fontSize: 12, color: C.muted },
  coinIcon: { width: 26, height: 26 },
  iconBtn: { padding: 6 },
  iconBtnText: { fontSize: 18 },
  addBtn: {
    marginHorizontal: 16, marginBottom: 4, padding: 15,
    borderRadius: C.rlg, borderWidth: 2, borderStyle: 'dashed',
    borderColor: C.pinkPill, backgroundColor: C.pinkLight, alignItems: 'center',
  },
  addText: { fontSize: 14, fontWeight: '700', color: C.pink },
  form: { marginHorizontal: 16, marginBottom: 8, backgroundColor: C.cardBg, borderRadius: C.rlg, padding: 16, gap: 12 },
  formTitle: { fontSize: 15, fontWeight: '800', color: C.text },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiOpt: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  emojiSel: { borderColor: C.pink, backgroundColor: C.pinkLight },
  input: {
    backgroundColor: C.bg, borderRadius: C.rsm, padding: 12,
    fontSize: 15, fontWeight: '600', color: C.text,
    borderWidth: 2, borderColor: C.border,
  },
  row2: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  freqRow: { gap: 6 },
  freqBtn: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: C.rsm,
    backgroundColor: C.bg, borderWidth: 1.5, borderColor: C.border,
  },
  freqSel: { backgroundColor: C.pinkLight, borderColor: C.pink },
  freqText: { fontSize: 12, fontWeight: '600', color: C.muted },
  freqTextSel: { color: C.pink },
  formBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, padding: 13, borderRadius: C.rmd,
    backgroundColor: C.bg, alignItems: 'center',
    borderWidth: 1.5, borderColor: C.border,
  },
  cancelText: { fontSize: 14, fontWeight: '700', color: C.muted },
  saveBtn: { flex: 1, padding: 13, borderRadius: C.rmd, backgroundColor: C.pink, alignItems: 'center' },
  saveText: { fontSize: 14, fontWeight: '800', color: '#fff' },
});
