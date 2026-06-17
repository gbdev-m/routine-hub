import { AppThemes, ThemeMode, getActualTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';

const categories = [
  {
    key: 'aparencia',
    title: 'Aparência',
    description: 'Personalize o visual do app',
    icon: '🎨',
    options: ['Tema Escuro', 'Tema do sistema', 'Tema claro'],
  },
  {
    key: 'idioma',
    title: 'Idioma',
    description: 'Selecione sua língua preferida',
    icon: '🌐',
    options: ['Em desenvolvimento.'],
  },
  {
    key: 'notificacoes',
    title: 'Notificações',
    description: 'Controle como o app alerta você',
    icon: '🔔',
    options: ['Ativar notificações', 'Antecedência padrão', 'Som das notificações'],
  },
  {
    key: 'sobre',
    title: 'Sobre',
    description: 'Saiba mais sobre o aplicativo',
    icon: 'ℹ️',
    options: ['Routine Hub', 'Versão: 1.0', 'Aplicativo offline-first para organização de rotina e foco, desenvolvido inicialmente como projeto acadêmico e evoluído para uso pessoal.', 'Projeto criado com foco em simplicidade, acessibilidade e produtividade sem distrações.'],
  },
];

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  
  // Theme settings
  const THEME_KEY = 'settings.theme';
  const [themeMode, setThemeMode] = useState<ThemeMode>('sistema');
  
  // Notification settings with defaults
  const NOTIF_KEY = 'settings.notifications';
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [defaultReminder, setDefaultReminder] = useState<number>(10);

  // Get actual theme based on mode and system
  const actualTheme = getActualTheme(themeMode, colorScheme);
  const colors = AppThemes[actualTheme];
  const reminderOptions: { label: string; value: number }[] = [
    { label: 'Na hora', value: 0 },
    { label: '10 min antes', value: 10 },
    { label: '30 min antes', value: 30 },
    { label: '1 h antes', value: 60 },
    { label: '3 h antes', value: 180 },
    { label: '12 h antes', value: 720 },
    { label: '1 dia antes', value: 1440 },
    { label: '3 dias antes', value: 4320 },
  ];

  const openCategory = (category: typeof categories[number]) => {
    setActiveCategory(category);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  // Load saved notification settings on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(NOTIF_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (typeof parsed.notificationsEnabled === 'boolean') setNotificationsEnabled(parsed.notificationsEnabled);
          if (typeof parsed.defaultReminder === 'number') setDefaultReminder(parsed.defaultReminder);
        }
      } catch (e) {
        console.error('Erro ao carregar notificações:', e);
      }
    })();

    // Load theme preference
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved && ['sistema', 'escuro', 'claro'].includes(saved)) {
          setThemeMode(saved as ThemeMode);
        }
      } catch (e) {
        console.error('Erro ao carregar tema:', e);
      }
    })();
  }, []);

  // Save when preferences change
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(
          NOTIF_KEY,
          JSON.stringify({ notificationsEnabled, defaultReminder })
        );
      } catch (e) {
        console.error('Erro ao salvar notificações:', e);
      }
    })();
  }, [notificationsEnabled, defaultReminder]);

  // Save theme when it changes
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(THEME_KEY, themeMode);
      } catch (e) {
        console.error('Erro ao salvar tema:', e);
      }
    })();
  }, [themeMode]);

  // Dynamic styles based on theme
  const dynamicStyles = {
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    categoryCard: { backgroundColor: colors.card },
    categoryTitle: { color: colors.text },
    categoryDescription: { color: colors.textSecondary },
    modalContainer: { backgroundColor: colors.card },
    modalTitle: { color: colors.text },
    modalDescription: { color: colors.textSecondary },
    modalOption: { backgroundColor: colors.buttonBackground },
    modalOptionText: { color: colors.text },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, dynamicStyles.title]}>Configurações</Text>
        </View>

        {categories.map(category => (
          <TouchableOpacity
            key={category.key}
            style={[styles.categoryCard, dynamicStyles.categoryCard]}
            onPress={() => openCategory(category)}
            activeOpacity={0.8}
          >
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <View style={styles.categoryText}>
                <Text style={[styles.categoryTitle, dynamicStyles.categoryTitle]}>{category.title}</Text>
                <Text style={[styles.categoryDescription, dynamicStyles.categoryDescription]}>{category.description}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.55)' }]}>
          <View style={[styles.modalContainer, dynamicStyles.modalContainer]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>{activeCategory.title}</Text>
              <TouchableOpacity onPress={closeModal} style={[styles.closeButton, { backgroundColor: colors.card }]} accessibilityLabel="Fechar modal">
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={[styles.modalDescription, dynamicStyles.modalDescription]}>{activeCategory.description}</Text>
              {activeCategory.key === 'aparencia' ? (
                <View>
                  {(['escuro'] as ThemeMode[]).map((mode) => {
                    const label = 'Tema escuro. (Claro e Sistema em desenvolvimento)';
                    
                    return (
                      <TouchableOpacity
                        key={mode}
                        style={[
                          styles.modalOption,
                          { backgroundColor: themeMode === mode ? colors.buttonBackground : colors.card },
                        ]}
                        onPress={() => setThemeMode(mode)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.modalOptionText,
                            { color: themeMode === mode ? '#4A90E2' : colors.text, fontWeight: themeMode === mode ? '700' : '400' },
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  <View style={[styles.modalOption, { backgroundColor: 'transparent', marginTop: 8 }]}>
                    <Text style={[styles.modalOptionText, { color: '#B6BEC8', fontSize: 13 }]}>
                      {themeMode === 'sistema' ? `Sistema: ${colorScheme === 'dark' ? 'escuro' : 'claro'}` : `Selecionado: ${themeMode}`}
                    </Text>
                  </View>
                </View>
              ) : activeCategory.key === 'notificacoes' ? (
                <View>
                  <View style={[styles.modalOptionRow, { backgroundColor: colors.card }]}>
                    <Text style={[styles.modalOptionText, { color: colors.text }]}>Ativar notificações</Text>
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={setNotificationsEnabled}
                      trackColor={{ false: '#3A3F4E', true: '#4A90E2' }}
                      thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
                    />
                  </View>

                  <Text style={[styles.modalDescription, { marginTop: 8, color: colors.textSecondary }]}>Antecedência padrão</Text>
                  {reminderOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.modalOption,
                        { backgroundColor: opt.value === defaultReminder ? colors.buttonBackground : colors.card },
                      ]}
                      onPress={() => setDefaultReminder(opt.value)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.modalOptionText,
                          { color: opt.value === defaultReminder ? '#4A90E2' : colors.text, fontWeight: opt.value === defaultReminder ? '700' : '400' },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <View style={[styles.modalOption, { backgroundColor: 'transparent' }]}>
                    <Text style={[styles.modalOptionText, { color: colors.textSecondary }]}>Som das notificações — Em desenvolvimento</Text>
                  </View>
                </View>
              ) : (
                activeCategory.options.map((option, index) => (
                  <View key={index} style={[styles.modalOption, { backgroundColor: colors.card }]}>
                    <Text style={[styles.modalOptionText, { color: colors.text }]}>{option}</Text>
                  </View>
                ))
              )}
            </ScrollView>
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
    marginBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  categoryCard: {
    backgroundColor: '#1E2230',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  categoryText: {
    flex: 1,
  },
  categoryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  categoryDescription: {
    color: '#B6BEC8',
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '75%',
    backgroundColor: '#12141C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1E2230',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingBottom: 20,
  },
  modalDescription: {
    color: '#B6BEC8',
    fontSize: 15,
    marginBottom: 16,
  },
  modalOption: {
    backgroundColor: '#1E2230',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  modalOptionText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  modalOptionSelected: {
    backgroundColor: '#2C3246',
  },
  modalOptionTextSelected: {
    color: '#4A90E2',
    fontWeight: '700',
  },
  modalOptionRow: {
    backgroundColor: '#1E2230',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
