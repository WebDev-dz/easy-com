import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, router, Slot } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {

  return (
    <View style={styles.container}>
      <Redirect href={'/(tabs)'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
});
