import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { pinStorage } from '@/hooks/usePin';
import { C } from '@/constants/colors';

export default function Entry() {
  const router = useRouter();

  useEffect(() => {
    pinStorage.isConfigured().then(configured => {
      router.replace(configured ? '/profile-select' : '/onboarding');
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator color={C.pink} size="large" />
    </View>
  );
}
