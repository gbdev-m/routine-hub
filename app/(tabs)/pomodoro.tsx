import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PomodoroScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Foco</Text>
          <TouchableOpacity style={styles.iconButton} accessibilityLabel="Configurações">
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.timerText}>25:00</Text>
          <Text style={styles.modeLabel}>Modo Foco</Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.actionButton} accessibilityLabel="Iniciar">
              <Text style={styles.actionButtonText}>Iniciar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} accessibilityLabel="Pausar">
              <Text style={styles.actionButtonText}>Pausar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} accessibilityLabel="Reiniciar">
              <Text style={styles.actionButtonText}>Reiniciar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomCard}>
          <Text style={styles.bottomTitle}>Tempos padrão</Text>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Foco</Text>
            <Text style={styles.timeValue}>25 min</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Pausa curta</Text>
            <Text style={styles.timeValue}>5 min</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Pausa longa</Text>
            <Text style={styles.timeValue}>15 min</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12141C',
  },
  content: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1E2230',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#1E2230',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '700',
    marginBottom: 12,
  },
  modeLabel: {
    color: '#B6BEC8',
    fontSize: 16,
    marginBottom: 24,
  },
  buttonGroup: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2C3246',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomCard: {
    backgroundColor: '#1E2230',
    borderRadius: 20,
    padding: 20,
  },
  bottomTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#242A38',
  },
  timeLabel: {
    color: '#B6BEC8',
    fontSize: 15,
  },
  timeValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
