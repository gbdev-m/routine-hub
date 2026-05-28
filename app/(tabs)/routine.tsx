import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const TODAY = new Date(2026, 4, 28);

export default function RoutineScreen() {
  const [modo, setModo] = useState<'lista' | 'calendario'>('lista');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = capitalize(currentDate.toLocaleDateString('pt-BR', { month: 'long' }));
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = (firstDay + 6) % 7;
  const totalCells = (() => {
    const total = offset + daysInMonth;
    return total + ((7 - (total % 7)) % 7);
  })();

  const calendarDays = Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - offset + 1;
    return dayNumber >= 1 && dayNumber <= daysInMonth ? dayNumber : null;
  });

  const isToday = (day: number | null) => {
    return (
      day !== null &&
      TODAY.getFullYear() === year &&
      TODAY.getMonth() === month &&
      TODAY.getDate() === day
    );
  };

  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  function renderLista() {
    return (
      <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Rotinas Diárias / Repetitivas</Text>
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Academia</Text>
              <Text style={styles.cardMeta}>07:30 · Seg, Qua, Sex</Text>
            </View>
            <TouchableOpacity accessibilityLabel="Detalhes Academia">
              <Ionicons name="information-circle-outline" size={24} color="#B6BEC8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.dateHeader}>📅 Amanhã - 29 de Maio</Text>
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Reunião de Alinhamento</Text>
              <Text style={styles.cardMeta}>14:00 · Das 14:00 às 16:00</Text>
            </View>
            <TouchableOpacity accessibilityLabel="Detalhes Reunião de Alinhamento">
              <Ionicons name="information-circle-outline" size={24} color="#B6BEC8" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.dateHeader}>📅 Sábado - 30 de Maio</Text>
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Consulta Médica</Text>
              <Text style={styles.cardMeta}>10:00 · Duração: 50 minutos</Text>
            </View>
            <TouchableOpacity accessibilityLabel="Detalhes Consulta Médica">
              <Ionicons name="information-circle-outline" size={24} color="#B6BEC8" />
            </TouchableOpacity>
          </View>
        </View>
      </>
    );
  }

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
                  isToday(day) && styles.calendarDayToday,
                ]}
                disabled={day === null}
                accessibilityLabel={day === null ? 'Dia vazio' : `Dia ${day}`}
              >
                <Text style={[
                  styles.calendarDayText,
                  isToday(day) && styles.calendarDayTextActive,
                  day === null && styles.calendarDayTextEmpty,
                ]}>
                  {day ?? ''}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Rotinas Diárias / Repetitivas aplicadas</Text>
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Academia</Text>
              <Text style={styles.cardMeta}>07:30 · Seg, Qua, Sex</Text>
            </View>
            <TouchableOpacity accessibilityLabel="Detalhes Academia">
              <Ionicons name="information-circle-outline" size={24} color="#B6BEC8" />
            </TouchableOpacity>
          </View>
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

      <TouchableOpacity style={styles.fab} accessibilityLabel="Adicionar rotina">
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
  calendarDayToday: {
    borderWidth: 1,
    borderColor: '#4D96FF',
  },
  calendarDayText: {
    color: '#B6BEC8',
    fontSize: 13,
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
});
