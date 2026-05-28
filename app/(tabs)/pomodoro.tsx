import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function PomodoroScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Foco</ThemedText>
      <ThemedText style={styles.subtitle}>
        Use o modo Pomodoro para dividir seu tempo em blocos focados e pausas restauradoras.
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
