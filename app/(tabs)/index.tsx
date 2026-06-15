import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSharedTasks } from './routine';

function getLocalDateISO(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export default function HojeScreen() {
  const tasks = useSharedTasks();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [time, setTime] = useState<string>(formatTime(new Date()));
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const todayISO = getLocalDateISO();
  const todayTasks = tasks.filter(task =>
    task.date === todayISO ||
    (task.isRoutine && task.weekDays?.includes(new Date().getDay()))
  );
  const selectedTask = selectedTaskId ? tasks.find(task => task.id === selectedTaskId) : undefined;

  useEffect(() => {
    const update = () => setTime(formatTime(new Date()));
    // update immediately then every minute
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  function toggle(id: string) {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const COLORS = {
    background: '#12141C',
    card: '#1E2230',
    text: '#FFFFFF',
    muted: '#B6BEC8',
    accent: '#4D96FF',
  };

  const today = new Date();
  const weekday = today.toLocaleDateString('pt-BR', { weekday: 'long' });
  const day = today.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });

  const total = todayTasks.length;
  const completed = todayTasks.filter(task => checked[task.id]).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const closeTaskDetails = () => {
    setDetailModalVisible(false);
    setSelectedTaskId(null);
  };

  const renderTaskDetailsModal = () => (
    <Modal animationType="slide" transparent visible={detailModalVisible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Detalhes da Tarefa</Text>
          <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
            {selectedTask ? (
              <>
                <View style={styles.detailCard}>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{selectedTask.title}</Text>
                    {selectedTask.description ? <Text style={styles.cardMeta}>{selectedTask.description}</Text> : null}
                    {selectedTask.isRoutine ? (
                      <Text style={styles.cardMeta}>Rotina · {formatWeekDays(selectedTask.weekDays ?? [])}</Text>
                    ) : selectedTask.date ? <Text style={styles.cardMeta}>Data: {formatTaskDate(selectedTask.date)}</Text> : null}
                    {selectedTask.time ? <Text style={styles.cardMeta}>Horário inicial: {selectedTask.time}</Text> : null}
                    {selectedTask.type === 'periodo' && selectedTask.endTime ? (
                      <Text style={styles.cardMeta}>Horário final: {selectedTask.endTime}</Text>
                    ) : null}
                    {selectedTask.type === 'duracao' && selectedTask.duration ? (
                      <Text style={styles.cardMeta}>Duração: {selectedTask.duration}</Text>
                    ) : null}
                    <Text style={styles.cardMeta}>Tipo: {capitalizeTaskType(selectedTask.type)}</Text>
                    {selectedTask.location ? <Text style={styles.cardMeta}>Local: {selectedTask.location}</Text> : null}
                    <Text style={styles.cardMeta}>Status: {selectedTask.completed ? 'Concluída' : 'Pendente'}</Text>
                  </View>
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalButton, styles.modalCancel]} onPress={closeTaskDetails}>
                    <Text style={styles.modalButtonText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Tarefa não encontrada.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: COLORS.background }]}> 
      {renderTaskDetailsModal()}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.headerBlock, { backgroundColor: '#252A3C' }]}>
          <Text style={[styles.clockText, { color: COLORS.text }]} accessibilityLabel={`Horário atual ${time}`}>{time}</Text>
          <Text style={[styles.dateText, { color: COLORS.muted }]}>{`${capitalize(weekday)}, ${capitalize(day)}`}</Text>

          <View style={styles.headerDivider} />

          <Text style={[styles.quoteText, { color: COLORS.muted, fontStyle: 'italic' }]}>Olá! Vamos um passo de cada vez hoje?</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.progressText, { color: COLORS.muted }]}>{`Progresso de hoje: ${percent}% (${completed} de ${total} concluídas)`}</Text>

          <View style={styles.progressContainer} accessibilityLabel={`Barra de progresso ${percent} por cento`}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${percent}%`, backgroundColor: COLORS.accent }]} />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { color: COLORS.muted }]}>Tarefas de Hoje</Text>

          <View style={styles.list}>
            {todayTasks.length === 0 ? (
              <Text style={[styles.emptyText, { color: COLORS.muted }]}>Nenhuma tarefa para hoje.</Text>
            ) : (
              todayTasks.map(task => {
                const isChecked = !!checked[task.id];
                return (
                  <View key={task.id} style={[styles.card, { backgroundColor: COLORS.card }]}> 
                    <View style={styles.colTime}>
                      <Text style={[styles.timeText, { color: COLORS.accent }]}>{task.time ?? '--'}</Text>
                    </View>

                    <View style={styles.colContent}>
                      <Text style={[styles.titleText, { color: COLORS.text }]} numberOfLines={2}>{task.title}</Text>
                      <Text style={[styles.durationText, { color: COLORS.muted }]}> 
                        {task.isRoutine ? 'Rotina · ' : ''}
                        {task.type === 'periodo'
                          ? `${task.time ?? '--'} - ${task.endTime ?? '--'}`
                          : task.duration
                          ? `⏱️ ${task.duration}`
                          : task.time
                          ? task.time
                          : 'Pontual'}
                        {' • '}{capitalizeTaskType(task.type)}
                        {task.isRoutine && task.weekDays?.length ? ` · ${formatWeekDays(task.weekDays)}` : ''}
                      </Text>
                    </View>

                    <View style={styles.colActions}>
                      <TouchableOpacity
                        onPress={() => toggle(task.id)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: isChecked }}
                        accessibilityLabel={`${task.title} marcar como concluída`}
                        style={[styles.checkbox, isChecked && styles.checkboxChecked]}
                      >
                        {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
                      </TouchableOpacity>

                      <TouchableOpacity
                        accessibilityLabel={`Detalhes ${task.title}`}
                        style={styles.infoButton}
                        onPress={() => {
                          setSelectedTaskId(task.id);
                          setDetailModalVisible(true);
                        }}
                      >
                        <Ionicons name="information-circle-outline" size={24} color={COLORS.muted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatWeekDays(days: number[]) {
  return days
    .slice()
    .sort((a, b) => a - b)
    .map(day => ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][day])
    .join(', ');
}

function capitalizeTaskType(type: 'pontual' | 'periodo' | 'duracao'): string {
  switch (type) {
    case 'pontual':
      return 'Pontual';
    case 'periodo':
      return 'Período';
    case 'duracao':
      return 'Duração';
    default:
      return type;
  }
}

function formatTaskDate(value: string) {
  const parts = value.split('-');
  if (parts.length !== 3) {
    return value;
  }
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 22,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 14,
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  list: {
    // spacing handled by card margins
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },
  colTime: {
    width: 72,
    alignItems: 'flex-start',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  colContent: {
    flex: 1,
    marginLeft: 14,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  durationText: {
    fontSize: 13,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardMeta: {
    color: '#B6BEC8',
    fontSize: 14,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
    color: '#B6BEC8',
  },
  colActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 12,
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2F3540',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#4D96FF',
    borderColor: '#4D96FF',
  },
  infoButton: {
    marginLeft: 8,
  },
  headerBlock: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  clockText: {
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 48,
    marginBottom: 6,
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginVertical: 12,
  },
  quoteText: {
    fontSize: 16,
  },
  progressText: {
    fontSize: 13,
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#12141C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalForm: {
    paddingBottom: 20,
  },
  detailCard: {
    backgroundColor: '#1E2230',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancel: {
    backgroundColor: '#4D96FF',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
