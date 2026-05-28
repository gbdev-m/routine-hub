import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function RoutineScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Rotina</ThemedText>
      <ThemedText style={styles.subtitle}>
        Organize seus hábitos e mantenha uma rotina leve e previsível.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
});
