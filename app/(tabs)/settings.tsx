import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const categories = [
  {
    key: 'aparencia',
    title: 'Aparência',
    description: 'Personalize o visual do app',
    icon: '🎨',
    options: ['Tema do sistema', 'Tema escuro', 'Tema claro', 'Alto contraste'],
  },
  {
    key: 'idioma',
    title: 'Idioma',
    description: 'Selecione sua língua preferida',
    icon: '🌐',
    options: ['Português', 'English', 'Español'],
  },
  {
    key: 'acessibilidade',
    title: 'Acessibilidade',
    description: 'Ajustes de leitura e navegabilidade',
    icon: '♿',
    options: ['Tamanho do texto', 'Contraste reforçado', 'Reduzir animações', 'Botões maiores'],
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
    options: ['Nome do aplicativo', 'Versão', 'App offline first para organização de rotina', 'Projeto acadêmico'],
  },
];

export default function SettingsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  const openCategory = (category: typeof categories[number]) => {
    setActiveCategory(category);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Configurações</Text>
        </View>

        {categories.map(category => (
          <TouchableOpacity
            key={category.key}
            style={styles.categoryCard}
            onPress={() => openCategory(category)}
            activeOpacity={0.8}
          >
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <View style={styles.categoryText}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription}>{category.description}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#B6BEC8" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activeCategory.title}</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton} accessibilityLabel="Fechar modal">
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalDescription}>{activeCategory.description}</Text>
              {activeCategory.options.map((option, index) => (
                <View key={index} style={styles.modalOption}>
                  <Text style={styles.modalOptionText}>{option}</Text>
                </View>
              ))}
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
});
