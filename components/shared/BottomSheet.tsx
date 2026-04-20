import React, { useEffect, useRef, useState } from 'react';
import {
  Modal, Animated, TouchableWithoutFeedback,
  View, Text, Pressable, StyleSheet, ScrollView,
} from 'react-native';
import { C } from '@/constants/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ visible, onClose, title, children }: Props) {
  const [mounted, setMounted] = useState(false);
  const translateY = useRef(new Animated.Value(700)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity,    { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 700, duration: 240, useNativeDriver: true }),
      ]).start(() => setMounted(false));
    }
  }, [visible]);

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[s.overlay, { opacity }]}>
          <TouchableWithoutFeedback>
            <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
              <View style={s.handle} />
              <View style={s.header}>
                <Text style={s.title}>{title}</Text>
                <Pressable style={s.closeBtn} onPress={onClose}>
                  <Text style={s.closeText}>✕</Text>
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {children}
              </ScrollView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingBottom: 32,
  },
  handle: {
    width: 38, height: 4,
    backgroundColor: '#E0D8D8',
    borderRadius: 4,
    alignSelf: 'center',
    marginTop: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  title: { fontSize: 18, fontWeight: '800', color: C.text },
  closeBtn: {
    width: 30, height: 30,
    borderRadius: 15,
    backgroundColor: C.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 14, fontWeight: '700', color: C.muted },
});
