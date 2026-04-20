import { C } from '@/constants/colors';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, Image } from 'react-native';

interface Props {
  blooms: number;
  bloomValue: number;
  childName: string;
}

export function BalanceBlock({ blooms, bloomValue, childName }: Props) {
  const animated = useRef(new Animated.Value(0)).current;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const id = animated.addListener(({ value }) => {
      setDisplayed(Math.round(value));
    });

    Animated.timing(animated, {
      toValue: blooms,
      duration: 800,
      useNativeDriver: false,
    }).start();

    return () => {
      animated.removeListener(id);
    };
  }, [blooms]);

  return (
    <View style={s.container}>
      <Image source={require('@/placeholders/bloom_coin.PNG')} style={s.coinImg} resizeMode="contain" />

      {/* 👇 Use the rounded value */}
      <Text style={s.amount}>{displayed}</Text>

      <Text style={s.label}>Blooms</Text>
      <Text style={s.mxn}>
        = ${(displayed * bloomValue).toFixed(2)} MXN
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 12 },
  coinImg: { width: 88, height: 88, marginBottom: 10 },
  amount: { fontSize: 52, fontWeight: '900', color: C.text, letterSpacing: -2, lineHeight: 56 },
  label: { fontSize: 16, fontWeight: '600', color: C.muted, marginTop: 2 },
  mxn: { fontSize: 14, fontWeight: '500', color: C.muted, marginTop: 6 },
});
