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
  View
} from 'react-native';

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEK_DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const TODAY = new Date();

type Task = {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  endTime?: string;
  duration?: string;
  type: 'pontual' | 'periodo' | 'duracao';
  location?: string;
  isRoutine?: boolean;
  weekDays?: number[];
  completed: boolean;
};

type TaskType = 'pontual' | 'periodo' | 'duracao';

const initialTasks: Task[] = [];

const TASKS_STORAGE_KEY = '@routine_hub_tasks';
let sharedTasks: Task[] = initialTasks;
const taskSubscribers = new Set<(tasks: Task[]) => void>();
let tasksLoaded = false;

function notifyTaskSubscribers() {
  taskSubscribers.forEach(callback => callback(sharedTasks));
}

async function saveTasksToStorage(tasks: Task[]) {
  try {
    await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.warn('Erro ao salvar tarefas:', error);
  }
}

async function loadTasksFromStorage() {
  try {
    const storedValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
    if (!storedValue) {
      return;
    }

    const parsed = JSON.parse(storedValue);
    if (!Array.isArray(parsed)) {
      console.warn('Dados de tarefas inválidos no AsyncStorage.');
      return;
    }

    sharedTasks = parsed;
    notifyTaskSubscribers();
  } catch (error) {
    console.warn('Erro ao carregar tarefas:', error);
  }
}

export function addTaskToStore(task: Task) {
  sharedTasks = [task, ...sharedTasks];
  notifyTaskSubscribers();
  void saveTasksToStorage(sharedTasks);
}

export function updateTaskInStore(task: Task) {
  sharedTasks = sharedTasks.map(existingTask =>
    existingTask.id === task.id ? task : existingTask
  );
  notifyTaskSubscribers();
  void saveTasksToStorage(sharedTasks);
}

export function removeTaskFromStore(taskId: string) {
  sharedTasks = sharedTasks.filter(task => task.id !== taskId);
  notifyTaskSubscribers();
  void saveTasksToStorage(sharedTasks);
}

export function useSharedTasks() {
  const [tasks, setTasks] = useState<Task[]>(sharedTasks);

  useEffect(() => {
    if (!tasksLoaded) {
      tasksLoaded = true;
      loadTasksFromStorage();
    }

    const listener = (nextTasks: Task[]) => setTasks(nextTasks);
    taskSubscribers.add(listener);

    return () => {
      taskSubscribers.delete(listener);
    };
  }, []);

  return tasks;
}

// Função para gerar dias do calendário com domingo como primeiro dia da semana
function generateCalendarDays(year: number, month: number) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1);
  const offset = firstDay.getDay();
  
  const totalCells = (() => {
    const total = offset + daysInMonth;
    return total + ((7 - (total % 7)) % 7);
  })();

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - offset + 1;
    return dayNumber >= 1 && dayNumber <= daysInMonth ? dayNumber : null;
  });
}

// Função para determinar o dia selecionado padrão
function getDefaultSelectedDay(year: number, month: number): number {
  const isCurrentMonth = year === TODAY.getFullYear() && month === TODAY.getMonth();
  return isCurrentMonth ? TODAY.getDate() : 1;
}

export default function RoutineScreen() {
  const [modo, setModo] = useState<'lista' | 'calendario'>('lista');
  const [currentDate, setCurrentDate] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(getDefaultSelectedDay(TODAY.getFullYear(), TODAY.getMonth()));
  const tasks = useSharedTasks();
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const selectedTask = selectedTaskId ? tasks.find(task => task.id === selectedTaskId) : undefined;
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('');
  const [type, setType] = useState<TaskType>('pontual');
  const [isRoutine, setIsRoutine] = useState(false);
  const [weekDays, setWeekDays] = useState<number[]>([]);
  const [location, setLocation] = useState('');

  const todayISO = TODAY.toISOString().slice(0, 10);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = capitalize(currentDate.toLocaleDateString('pt-BR', { month: 'long' }));
  
  const calendarDays = generateCalendarDays(year, month);
  const selectedDateISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const selectedDayOfWeek = new Date(year, month, selectedDay).getDay();
  const dailyTasks = tasks.filter(task => !task.isRoutine && task.date === selectedDateISO);
  const routineTasks = tasks.filter(task => task.isRoutine && task.weekDays?.includes(selectedDayOfWeek));

  const isSelected = (day: number | null) => day === selectedDay;
  const isTodayDate = (day: number | null) =>
    day !== null &&
    year === TODAY.getFullYear() &&
    month === TODAY.getMonth() &&
    day === TODAY.getDate();

  const handleDayPress = (day: number | null) => {
    if (day !== null) {
      setSelectedDay(day);
    }
  };

  const openTaskDetails = (task: Task) => {
    setSelectedTaskId(task.id);
    setDetailModalVisible(true);
  };

  const closeTaskDetails = () => {
    setDetailModalVisible(false);
    setSelectedTaskId(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description ?? '');
    setTime(task.time ?? '');
    setEndTime(task.endTime ?? '');
    setDuration(task.duration ? task.duration.replace(/\D/g, '') : '');
    setType(task.type);
    setIsRoutine(task.isRoutine ?? false);
    setWeekDays(task.weekDays ?? []);
    setDate(task.isRoutine ? '' : task.date ? formatTaskDate(task.date) : '');
    setLocation(task.location ?? '');
    setDetailModalVisible(false);
    setModalVisible(true);
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      'Excluir tarefa',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            removeTaskFromStore(taskId);
            closeTaskDetails();
          },
        },
      ]
    );
  };

  const prevMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    setSelectedDay(getDefaultSelectedDay(newDate.getFullYear(), newDate.getMonth()));
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    setSelectedDay(getDefaultSelectedDay(newDate.getFullYear(), newDate.getMonth()));
  };

  const handleResetForm = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setEndTime('');
    setDuration('');
    setType('pontual');
    setIsRoutine(false);
    setWeekDays([]);
    setLocation('');
    setEditingTaskId(null);
  };

  const handleSaveTask = () => {
    const trimmedTitle = title.trim();
    const trimmedDate = date.trim();
    const trimmedTime = time.trim();
    const trimmedEndTime = endTime.trim();
    const trimmedDuration = duration.trim();

    const existingTask = editingTaskId ? tasks.find(task => task.id === editingTaskId) : undefined;

    if (!trimmedTitle) {
      Alert.alert('Erro', 'O título é obrigatório');
      return;
    }

    if (!trimmedTime || !isValidTime(trimmedTime)) {
      Alert.alert('Erro', 'Horário inicial inválido. Use o formato HH:mm');
      return;
    }

    const normalizedDate = normalizeDateString(trimmedDate);

    if (isRoutine) {
      if (weekDays.length === 0) {
        Alert.alert('Erro', 'Selecione pelo menos um dia da semana para repetir na rotina');
        return;
      }
    } else {
      if (!normalizedDate) {
        Alert.alert('Erro', 'Data inválida. Use o formato DD/MM/AAAA');
        return;
      }
    }

    if (type === 'periodo') {
      if (!trimmedEndTime || !isValidTime(trimmedEndTime)) {
        Alert.alert('Erro', 'Para tarefas de período, horário final é obrigatório no formato HH:mm');
        return;
      }
    } else if (type === 'duracao') {
      if (!trimmedDuration || isNaN(Number(trimmedDuration)) || Number(trimmedDuration) <= 0) {
        Alert.alert('Erro', 'Para tarefas de duração, a duração em minutos é obrigatória e deve ser um número positivo');
        return;
      }
    }

    const taskPayload: Task = {
      id: editingTaskId ?? Date.now().toString(),
      title: trimmedTitle,
      description: description.trim() || undefined,
      date: isRoutine ? undefined : normalizedDate,
      time: trimmedTime,
      endTime: type === 'periodo' ? trimmedEndTime : undefined,
      duration: type === 'duracao' ? `${trimmedDuration} min` : undefined,
      type,
      location: location.trim() || undefined,
      isRoutine,
      weekDays: isRoutine ? weekDays : undefined,
      completed: existingTask?.completed ?? false,
    };

    if (editingTaskId) {
      updateTaskInStore(taskPayload);
    } else {
      addTaskToStore(taskPayload);
    }

    handleResetForm();
    setModalVisible(false);
  };

  const renderLista = () => {
    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Minhas Tarefas</Text>
          {tasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhuma tarefa cadastrada ainda.</Text>
            </View>
          ) : (
            tasks.map(task => (
              <View key={task.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{task.title}</Text>
                  <Text style={styles.cardMeta} numberOfLines={2}>
                    {task.isRoutine ? 'Rotina' : task.date ? `${formatTaskDate(task.date)} · ` : ''}
                    {task.type === 'periodo'
                      ? `${task.time ?? '--'} às ${task.endTime ?? '--'}`
                      : task.duration
                      ? `Duração: ${task.duration}`
                      : task.time
                      ? task.time
                      : 'Pontual'}
                    {' • '}{capitalizeTaskType(task.type)}
                  </Text>
                  {task.isRoutine && task.weekDays?.length ? (
                    <Text style={styles.cardMeta}>{formatWeekDays(task.weekDays)}</Text>
                  ) : null}
                  {task.location ? <Text style={styles.cardMeta}>{task.location}</Text> : null}
                </View>
                <TouchableOpacity accessibilityLabel={`Detalhes ${task.title}`} onPress={() => openTaskDetails(task)}>
                  <Ionicons name="information-circle-outline" size={24} color="#B6BEC8" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </>
    );
  };

  const renderModal = () => (
    <Modal animationType="slide" transparent visible={modalVisible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{editingTaskId ? 'Editar Tarefa' : 'Nova Tarefa'}</Text>
          <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
            <TextInput
              placeholder="Título"
              placeholderTextColor="#8891A6"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              returnKeyType="next"
            />
            <View style={styles.typeSelector}>
              {(['pontual', 'periodo', 'duracao'] as TaskType[]).map(value => (
                <TouchableOpacity
                  key={value}
                  onPress={() => {
                    setType(value);
                    if (value !== 'periodo') {
                      setEndTime('');
                    }
                    if (value !== 'duracao') {
                      setDuration('');
                    }
                  }}
                  style={[
                    styles.typeButton,
                    type === value && styles.typeButtonActive,
                  ]}
                >
                  <Text style={[styles.typeButtonText, type === value && styles.typeButtonTextActive]}>{capitalizeTaskType(value)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.repeatToggle, isRoutine && styles.repeatToggleActive]}
              onPress={() => {
                const nextValue = !isRoutine;
                setIsRoutine(nextValue);
                if (nextValue) {
                  setDate('');
                } else {
                  setWeekDays([]);
                }
              }}
            >
              <Text style={styles.repeatToggleText}>Repetir na rotina</Text>
              <Text style={[styles.repeatToggleValue, isRoutine && styles.repeatToggleValueActive]}>{isRoutine ? 'Sim' : 'Não'}</Text>
            </TouchableOpacity>
            {isRoutine ? (
              <>
                <Text style={styles.sectionTitle}>Repetir em</Text>
                <View style={styles.weekdaySelector}>
                  {WEEK_DAYS_SHORT.map((day, index) => {
                    const selected = weekDays.includes(index);
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.weekdayButton,
                          selected && styles.weekdayButtonActive,
                        ]}
                        onPress={() => {
                          setWeekDays(prev =>
                            prev.includes(index)
                              ? prev.filter(value => value !== index)
                              : [...prev, index]
                          );
                        }}
                      >
                        <Text style={[
                          styles.weekdayButtonText,
                          selected && styles.weekdayButtonTextActive,
                        ]}>{day}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            ) : (
              <TextInput
                placeholder="Data (DD/MM/AAAA)"
                placeholderTextColor="#8891A6"
                value={date}
                onChangeText={value => setDate(maskDateInput(value))}
                style={styles.input}
                keyboardType="numeric"
              />
            )}
            <TextInput
              placeholder="Horário inicial"
              placeholderTextColor="#8891A6"
              value={time}
              onChangeText={value => setTime(maskTimeInput(value))}
              style={styles.input}
              keyboardType="numeric"
            />
            {type === 'periodo' && (
              <TextInput
                placeholder="Horário final"
                placeholderTextColor="#8891A6"
                value={endTime}
                onChangeText={value => setEndTime(maskTimeInput(value))}
                style={styles.input}
                keyboardType="numeric"
              />
            )}
            {type === 'duracao' && (
              <TextInput
                placeholder="Duração (minutos)"
                placeholderTextColor="#8891A6"
                value={duration}
                onChangeText={setDuration}
                style={styles.input}
                keyboardType="numeric"
              />
            )}
            <TextInput
              placeholder="Descrição"
              placeholderTextColor="#8891A6"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.textArea]}
              multiline
            />
            <TextInput
              placeholder="Local / Endereço"
              placeholderTextColor="#8891A6"
              value={location}
              onChangeText={setLocation}
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => {
                  handleResetForm();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalSave]} onPress={handleSaveTask}>
                <Text style={[styles.modalButtonText, styles.modalSaveText]}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderDetailsModal = () => (
    <Modal animationType="slide" transparent visible={detailModalVisible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Detalhes da Tarefa</Text>
          <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
            {selectedTask ? (
              <>
                <View style={styles.card}>
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
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancel]}
                    onPress={closeTaskDetails}
                  >
                    <Text style={styles.modalButtonText}>Fechar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSave]}
                    onPress={() => selectedTask && handleEditTask(selectedTask)}
                  >
                    <Text style={[styles.modalButtonText, styles.modalSaveText]}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalDelete]}
                    onPress={() => selectedTask && handleDeleteTask(selectedTask.id)}
                  >
                    <Text style={[styles.modalButtonText, styles.modalSaveText]}>Excluir</Text>
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

  function renderCalendario() {
    return (
      <>
        <View style={styles.calendarHeader}>
          <View style={styles.calendarHeaderTop}>
            <TouchableOpacity onPress={prevMonth} accessibilityLabel="Mês anterior">
              <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{`${capitalize(monthName)} ${year}`}</Text>
            <TouchableOpacity onPress={nextMonth} accessibilityLabel="Próximo mês">
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekHeader}>
            {WEEK_DAYS.map(day => (
              <Text key={day} style={styles.weekHeaderText}>{day}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.calendarDay,
                  day === null && styles.calendarDayEmpty,
                  isTodayDate(day) && styles.calendarDayToday,
                  isSelected(day) && styles.calendarDaySelected,
                ]}
                onPress={() => handleDayPress(day)}
                disabled={day === null}
                accessibilityLabel={day === null ? 'Dia vazio' : `Dia ${day}`}
              >
                <Text style={[
                  styles.calendarDayText,
                  isTodayDate(day) && styles.calendarDayTextToday,
                  isSelected(day) && styles.calendarDayTextActive,
                  day === null && styles.calendarDayTextEmpty,
                ]}>
                  {day ?? ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tarefas do dia</Text>
          {dailyTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhuma tarefa para este dia.</Text>
            </View>
          ) : (
            dailyTasks.map(task => (
              <View key={task.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{task.title}</Text>
                  <Text style={styles.cardMeta} numberOfLines={2}>
                    {task.date ? `${formatTaskDate(task.date)} · ` : ''}
                    {task.type === 'periodo'
                      ? `${task.time ?? '--'} às ${task.endTime ?? '--'}`
                      : task.duration
                      ? `Duração: ${task.duration}`
                      : task.time
                      ? task.time
                      : 'Pontual'}
                    {' • '}{capitalizeTaskType(task.type)}
                  </Text>
                  {task.location ? <Text style={styles.cardMeta}>{task.location}</Text> : null}
                </View>
                <TouchableOpacity accessibilityLabel={`Detalhes ${task.title}`} onPress={() => openTaskDetails(task)}>
                  <Ionicons name="information-circle-outline" size={24} color="#B6BEC8" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Rotinas aplicadas</Text>
          {routineTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhuma rotina aplicada para este dia.</Text>
            </View>
          ) : (
            routineTasks.map(task => (
              <View key={task.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{task.title}</Text>
                  <Text style={styles.cardMeta}>Rotina</Text>
                  <Text style={styles.cardMeta} numberOfLines={2}>
                    {task.time ? `${task.time} · ` : ''}{capitalizeTaskType(task.type)}
                  </Text>
                  <Text style={styles.cardMeta}>{formatWeekDays(task.weekDays ?? [])}</Text>
                  {task.location ? <Text style={styles.cardMeta}>{task.location}</Text> : null}
                </View>
                <TouchableOpacity accessibilityLabel={`Detalhes ${task.title}`} onPress={() => openTaskDetails(task)}>
                  <Ionicons name="information-circle-outline" size={24} color="#B6BEC8" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topSpacer} />
        <View style={styles.selectorContainer}>
          <TouchableOpacity
            style={[styles.selectorButton, modo === 'lista' && styles.selectorButtonActive]}
            onPress={() => setModo('lista')}
          >
            <Text style={[styles.selectorText, modo === 'lista' && styles.selectorTextActive]}>Lista</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.selectorButton, modo === 'calendario' && styles.selectorButtonActive]}
            onPress={() => setModo('calendario')}
          >
            <Text style={[styles.selectorText, modo === 'calendario' && styles.selectorTextActive]}>Calendário</Text>
          </TouchableOpacity>
        </View>

        {modo === 'lista' ? renderLista() : renderCalendario()}
      </ScrollView>

      {renderModal()}
      {renderDetailsModal()}

      <TouchableOpacity
        style={styles.fab}
        accessibilityLabel="Adicionar tarefa"
        onPress={() => {
          handleResetForm();
          if (modo === 'calendario') {
            setDate(`${String(selectedDay).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`);
            setIsRoutine(false);
          }
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeDateString(value: string): string | undefined {
  const cleaned = value.trim();

  const parts = cleaned.split(/[/-]/);

  if (!cleaned) {
    return undefined;
  }

  if (parts.length !== 3) {
    return undefined;
  }

  let year = parts[0];
  let month = parts[1];
  let day = parts[2];

  if (cleaned.includes('/')) {
    [day, month, year] = parts;
  }

  if (year.length !== 4) {
    return undefined;
  }

  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);

  const date = new Date(numericYear, numericMonth - 1, numericDay);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== numericYear ||
    date.getMonth() + 1 !== numericMonth ||
    date.getDate() !== numericDay
  ) {
    return undefined;
  }

  return `${date.getFullYear().toString().padStart(4, '0')}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
}

function formatTaskDate(value: string) {
  const parts = value.split('-');
  if (parts.length !== 3) {
    return value;
  }
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function maskDateInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (digits.length <= 2) {
    return day;
  }
  if (digits.length <= 4) {
    return `${day}/${month}`;
  }
  return `${day}/${month}/${year}`;
}

function maskTimeInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

function isValidTime(timeString: string): boolean {
  const pattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return pattern.test(timeString);
}

function formatWeekDays(days: number[]) {
  return days
    .slice()
    .sort((a, b) => a - b)
    .map(day => WEEK_DAYS_SHORT[day])
    .join(', ');
}

function capitalizeTaskType(type: TaskType): string {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#12141C',
  },
  content: {
    paddingTop: 20,
    paddingBottom: 120,
    paddingHorizontal: 20,
  },
  topSpacer: {
    height: 20,
  },
  selectorContainer: {
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#1E2230',
    borderRadius: 25,
    flexDirection: 'row',
    padding: 4,
    marginBottom: 20,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 21,
  },
  selectorButtonActive: {
    backgroundColor: '#2C3246',
  },
  selectorText: {
    color: '#B6BEC8',
    fontWeight: '600',
  },
  selectorTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  dateHeader: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E2230',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardMeta: {
    color: '#B6BEC8',
    fontSize: 14,
  },
  calendarHeader: {
    marginBottom: 24,
  },
  calendarHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekHeaderText: {
    color: '#B6BEC8',
    fontSize: 12,
    width: '13%',
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calendarDay: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#17202A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  calendarDayEmpty: {
    backgroundColor: 'transparent',
  },
  calendarDaySelected: {
    borderWidth: 1,
    borderColor: '#4D96FF',
  },
  calendarDayToday: {
    borderWidth: 1,
    borderColor: '#8DE5FF',
    backgroundColor: '#243852',
  },
  calendarDayText: {
    color: '#B6BEC8',
    fontSize: 13,
  },
  calendarDayTextToday: {
    color: '#8DE5FF',
    fontWeight: '700',
  },
  calendarDayTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarDayTextEmpty: {
    color: 'transparent',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4D96FF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#B6BEC8',
    fontSize: 14,
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
  input: {
    backgroundColor: '#1E2230',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#1E2230',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: '#2C3246',
    borderColor: '#4D96FF',
  },
  typeButtonText: {
    color: '#B6BEC8',
    fontSize: 12,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  repeatToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#1E2230',
    marginBottom: 12,
  },
  repeatToggleActive: {
    borderWidth: 1,
    borderColor: '#4D96FF',
  },
  repeatToggleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  repeatToggleValue: {
    color: '#B6BEC8',
    fontSize: 14,
    fontWeight: '600',
  },
  repeatToggleValueActive: {
    color: '#4D96FF',
  },
  weekdaySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  weekdayButton: {
    width: '13%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#17202A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayButtonActive: {
    backgroundColor: '#4D96FF',
  },
  weekdayButtonText: {
    color: '#B6BEC8',
    fontSize: 12,
    fontWeight: '700',
  },
  weekdayButtonTextActive: {
    color: '#FFFFFF',
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
    backgroundColor: '#1E2230',
  },
  modalSave: {
    backgroundColor: '#4D96FF',
  },
  modalDelete: {
    backgroundColor: '#D9534F',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B6BEC8',
  },
  modalSaveText: {
    color: '#FFFFFF',
  },
});
