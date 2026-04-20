import AsyncStorage from '@react-native-async-storage/async-storage';

const K = {
  pin:        'bloom:pin',
  email:      'bloom:recovery_email',
  configured: 'bloom:configured',
};

export const pinStorage = {
  isConfigured: async () => (await AsyncStorage.getItem(K.configured)) === 'true',

  setup: async (pin: string, email: string) => {
    await AsyncStorage.multiSet([
      [K.pin, pin],
      [K.email, email],
      [K.configured, 'true'],
    ]);
  },

  verify: async (input: string) => (await AsyncStorage.getItem(K.pin)) === input,

  getEmail: async () => AsyncStorage.getItem(K.email),

  updatePin: async (pin: string) => AsyncStorage.setItem(K.pin, pin),

  reset: async () => AsyncStorage.multiRemove([K.pin, K.email, K.configured]),
};
