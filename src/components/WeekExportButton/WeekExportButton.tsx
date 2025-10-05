import React from 'react';
import styled from 'styled-components';
import GoogleCalendarButton from '../GoogleCalendarButton';
import { openGoogleCalendarForWeek } from '../../services/googleCalendar';
import { StudentPair } from '../../models/StudentPair';
import { useTimeSlots } from '../../queries/useTimeSlots';
import { useWeekStore } from '../../store/weekStore';
import { Schedule } from '../../models/Schedule';
import dayjs from 'dayjs';

const WeekExportContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px 0;
  grid-column: 1 / -1;
`;

interface WeekExportButtonProps {
  schedule?: Schedule<StudentPair>;
}

export const WeekExportButton: React.FC<WeekExportButtonProps> = ({ schedule }) => {
  const { data: timeSlots } = useTimeSlots();
  const { currentWeek } = useWeekStore();

  const handleExportWeek = () => {
    if (!timeSlots || !schedule || !currentWeek) return;

    const weekValue: Record<string, keyof Schedule<StudentPair>> = {
      firstWeek: 'scheduleFirstWeek',
      secondWeek: 'scheduleSecondWeek',
    };

    const weekScheduleData = schedule[weekValue[currentWeek]];
    
    // Перетворюємо дані тижня в формат для експорту
    const weekScheduleMatrix: (StudentPair | null)[][] = [];
    
    // Ініціалізуємо матрицю для 6 днів (понеділок-субота)
    for (let day = 0; day < 6; day++) {
      weekScheduleMatrix[day] = [];
      
      // Знаходимо розклад для поточного дня
      const dayData = weekScheduleData.find(daySchedule => {
        // Припускаємо, що day в WeekSchedule відповідає дню тижня (1-6)
        return parseInt(daySchedule.day) === day + 1;
      });
      
      if (dayData) {
        // Заповнюємо слоти парами або null
        for (let slot = 0; slot < timeSlots.length; slot++) {
          const pair = dayData.pairs.find(p => p.time === timeSlots[slot]);
          weekScheduleMatrix[day][slot] = pair || null;
        }
      } else {
        // Якщо немає даних для дня, заповнюємо null
        for (let slot = 0; slot < timeSlots.length; slot++) {
          weekScheduleMatrix[day][slot] = null;
        }
      }
    }

    // Розраховуємо початок поточного тижня
    const today = dayjs();
    const startOfWeek = today.startOf('week').add(1, 'day'); // Понеділок
    
    openGoogleCalendarForWeek(weekScheduleMatrix, timeSlots, startOfWeek.toDate());
  };

  const hasSchedule = schedule && (
    schedule.scheduleFirstWeek.length > 0 || 
    schedule.scheduleSecondWeek.length > 0
  );

  if (!hasSchedule) return null;

  return (
    <WeekExportContainer>
      <GoogleCalendarButton onClick={handleExportWeek} variant="secondary">
        Експортувати тиждень до Google Calendar
      </GoogleCalendarButton>
    </WeekExportContainer>
  );
};

export default WeekExportButton;
