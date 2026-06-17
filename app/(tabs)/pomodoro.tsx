import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Mode = 'foco' | 'pausaCurta' | 'pausaLonga';

interface Settings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  cyclesUntilLongBreak: number;
}

const DEFAULT_SETTINGS: Settings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  cyclesUntilLongBreak: 4,
};

const SETTINGS_KEY = 'pomodoroSettings';

export default function PomodoroScreen() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [currentMode, setCurrentMode] = useState<Mode>('foco');
  const [secondsRemaining, setSecondsRemaining] = useState(DEFAULT_SETTINGS.focusMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Configurações do modal
  const [tempSettings, setTempSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Carregar configurações ao montar o componente
  useEffect(() => {
    loadSettings();
  }, []);

  // Timer principal
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && secondsRemaining === 0) {
      // Timer chegou a zero
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, secondsRemaining, currentMode, cyclesCompleted, settings]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        setTempSettings(parsed);
        setSecondsRemaining(parsed.focusMinutes * 60);
      } else {
        setTempSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const getModeDurationSeconds = (mode: Mode, currentSettings: Settings): number => {
    switch (mode) {
      case 'foco':
        return currentSettings.focusMinutes * 60;
      case 'pausaCurta':
        return currentSettings.shortBreakMinutes * 60;
      case 'pausaLonga':
        return currentSettings.longBreakMinutes * 60;
    }
  };

  const handleTimerComplete = () => {
    if (currentMode === 'foco') {
      const newCyclesCompleted = cyclesCompleted + 1;
      setCyclesCompleted(newCyclesCompleted);

      if (newCyclesCompleted % settings.cyclesUntilLongBreak === 0) {
        setCurrentMode('pausaLonga');
        setSecondsRemaining(getModeDurationSeconds('pausaLonga', settings));
      } else {
        setCurrentMode('pausaCurta');
        setSecondsRemaining(getModeDurationSeconds('pausaCurta', settings));
      }
    } else {
      // Pausa curta ou longa -> voltar para foco
      setCurrentMode('foco');
      setSecondsRemaining(getModeDurationSeconds('foco', settings));
    }
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleRestart = () => {
    setIsRunning(false);
    setCurrentMode('foco');
    setSecondsRemaining(settings.focusMinutes * 60);
    setCyclesCompleted(0);
  };

  const handleSettingsOpen = () => {
    setTempSettings(settings);
    setShowSettingsModal(true);
  };

  const handleRestoreDefaults = () => {
    saveSettings(DEFAULT_SETTINGS);
    setIsRunning(false);
    setCurrentMode('foco');
    setSecondsRemaining(DEFAULT_SETTINGS.focusMinutes * 60);
    setCyclesCompleted(0);
    setShowSettingsModal(false);
  };

  const handleSettingsSave = () => {
    const focus = parseInt(tempSettings.focusMinutes.toString(), 10);
    const shortBreak = parseInt(tempSettings.shortBreakMinutes.toString(), 10);
    const longBreak = parseInt(tempSettings.longBreakMinutes.toString(), 10);
    const cycles = parseInt(tempSettings.cyclesUntilLongBreak.toString(), 10);

    // Validar números positivos
    if (focus <= 0 || shortBreak <= 0 || longBreak <= 0 || cycles <= 0) {
      Alert.alert('Erro', 'Todos os valores devem ser números positivos');
      return;
    }

    const newSettings: Settings = {
      focusMinutes: focus,
      shortBreakMinutes: shortBreak,
      longBreakMinutes: longBreak,
      cyclesUntilLongBreak: cycles,
    };

    saveSettings(newSettings);
    setIsRunning(false);
    setCurrentMode('foco');
    setSecondsRemaining(newSettings.focusMinutes * 60);
    setCyclesCompleted(0);
    setShowSettingsModal(false);
  };

  const getModeLabel = (): string => {
    switch (currentMode) {
      case 'foco':
        return 'Modo Foco';
      case 'pausaCurta':
        return 'Pausa curta';
      case 'pausaLonga':
        return 'Pausa longa';
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Foco</Text>
          <TouchableOpacity
            style={styles.iconButton}
            accessibilityLabel="Configurações"
            onPress={handleSettingsOpen}
          >
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.timerText}>{formatTime(secondsRemaining)}</Text>
          <Text style={styles.modeLabel}>{getModeLabel()}</Text>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.actionButton}
              accessibilityLabel="Iniciar"
              onPress={handleStart}
              disabled={isRunning}
            >
              <Text style={styles.actionButtonText}>Iniciar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              accessibilityLabel="Pausar"
              onPress={handlePause}
              disabled={!isRunning}
            >
              <Text style={styles.actionButtonText}>Pausar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              accessibilityLabel="Reiniciar"
              onPress={handleRestart}
            >
              <Text style={styles.actionButtonText}>Reiniciar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomCard}>
          <Text style={styles.bottomTitle}>Tempos padrão</Text>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Foco</Text>
            <Text style={styles.timeValue}>{settings.focusMinutes} min</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Pausa curta</Text>
            <Text style={styles.timeValue}>{settings.shortBreakMinutes} min</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>Pausa longa</Text>
            <Text style={styles.timeValue}>{settings.longBreakMinutes} min</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configurações do Pomodoro</Text>
              <TouchableOpacity
                onPress={() => setShowSettingsModal(false)}
                accessibilityLabel="Fechar modal"
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.settingField}>
                <Text style={styles.settingLabel}>Minutos de Foco</Text>
                <TextInput
                  style={styles.settingInput}
                  keyboardType="numeric"
                  value={tempSettings.focusMinutes.toString()}
                  onChangeText={(text) =>
                    setTempSettings({
                      ...tempSettings,
                      focusMinutes: text ? parseInt(text, 10) : 0,
                    })
                  }
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.settingField}>
                <Text style={styles.settingLabel}>Minutos de Pausa Curta</Text>
                <TextInput
                  style={styles.settingInput}
                  keyboardType="numeric"
                  value={tempSettings.shortBreakMinutes.toString()}
                  onChangeText={(text) =>
                    setTempSettings({
                      ...tempSettings,
                      shortBreakMinutes: text ? parseInt(text, 10) : 0,
                    })
                  }
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.settingField}>
                <Text style={styles.settingLabel}>Minutos de Pausa Longa</Text>
                <TextInput
                  style={styles.settingInput}
                  keyboardType="numeric"
                  value={tempSettings.longBreakMinutes.toString()}
                  onChangeText={(text) =>
                    setTempSettings({
                      ...tempSettings,
                      longBreakMinutes: text ? parseInt(text, 10) : 0,
                    })
                  }
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.settingField}>
                <Text style={styles.settingLabel}>Ciclos até Pausa Longa</Text>
                <TextInput
                  style={styles.settingInput}
                  keyboardType="numeric"
                  value={tempSettings.cyclesUntilLongBreak.toString()}
                  onChangeText={(text) =>
                    setTempSettings({
                      ...tempSettings,
                      cyclesUntilLongBreak: text ? parseInt(text, 10) : 0,
                    })
                  }
                  placeholderTextColor="#666"
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtonGroup}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowSettingsModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.resetButton]}
                onPress={handleRestoreDefaults}
              >
                <Text style={styles.modalButtonText}>Restaurar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSettingsSave}
              >
                <Text style={styles.modalButtonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E2230',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#242A38',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  settingField: {
    marginBottom: 20,
  },
  settingLabel: {
    color: '#B6BEC8',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  settingInput: {
    backgroundColor: '#242A38',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2C3246',
  },
  modalButtonGroup: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#242A38',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#2C3246',
  },
  resetButton: {
    backgroundColor: '#6B5B6B',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
