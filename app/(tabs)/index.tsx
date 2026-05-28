import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TASKS = [
  { id: '1', type: 'punctual', title: 'Tomar o remédio' },
  { id: '2', type: 'punctual', title: 'Responder e-mail do orientador' },
  { id: '3', type: 'duration', title: 'Estudar React Native', duration: '50 min' },
];

export default function HojeScreen() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const BG = '#121214';
  const CARD = '#1A1A1E';
  const TEXT = '#E6E6E6';
  const MUTED = '#9AA0A6';

  return (
    <View style={[styles.container, { backgroundColor: BG }]}> 
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: TEXT }]}>Olá! Vamos um passo de cada vez hoje?</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: MUTED }]}>Tarefas de Hoje</Text>

        <View style={styles.taskList}>
          {TASKS.map(task => {
            const isChecked = !!checked[task.id];

            return (
              <View key={task.id} style={[styles.card, { backgroundColor: CARD }]}> 
                <View style={styles.cardLeft}>
                  <TouchableOpacity
                    onPress={() => toggle(task.id)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isChecked }}
                    accessibilityLabel={task.title}
                    style={[styles.checkbox, isChecked && styles.checkboxChecked]}
                  />

                  <Text style={[styles.taskText, { color: TEXT }]}> {task.title} </Text>
                </View>

                <View style={styles.cardRight}>
                  {task.type === 'duration' && (
                    <View style={styles.durationBadge}>
                      <Ionicons name="time-outline" size={14} color={MUTED} />
                      <Text style={[styles.durationText, { color: MUTED }]}>{task.duration}</Text>
                    </View>
                  )}

                  <TouchableOpacity accessibilityLabel={`Detalhes ${task.title}`}>
                    <Ionicons name="information-circle-outline" size={24} color={'#BFC5C9'} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  taskList: {
    // vertical list spacing
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderRadius: 6,
    borderColor: '#444',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#4B8BF5',
    borderColor: '#4B8BF5',
  },
  taskText: {
    fontSize: 16,
    flexShrink: 1,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'transparent',
  },
  durationText: {
    marginLeft: 6,
    fontSize: 12,
  },
});
