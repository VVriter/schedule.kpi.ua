import React from 'react';
import styled from 'styled-components';
import { media } from '../../common/styles/styles';
import { getValueFromTheme } from '../../common/utils/getValueFromTheme';
import GoogleCalendarButton from '../../components/GoogleCalendarButton';
import { openGoogleCalendarForDay } from '../../services/googleCalendar';
import { StudentPair } from '../../models/StudentPair';
import { useTimeSlots } from '../../queries/useTimeSlots';
import dayjs from 'dayjs';

const WeekDayContainer = styled.div`
  text-align: center;
  font-weight: 600;
  font-size: 18px;
  padding: 24px 0px;
  color: ${getValueFromTheme('primaryFontColor')};
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  ${media.extraSmallMode} {
    display: none;
  }
`;

const DayTitle = styled.div`
  margin-bottom: 4px;
`;

interface WeekDayWithExportProps {
  children: React.ReactNode;
  dayIndex: number;
  daySchedule?: (StudentPair | null)[];
}

export const WeekDayWithExport: React.FC<WeekDayWithExportProps> = ({
  children,
  dayIndex,
  daySchedule = [],
}) => {
  const { data: timeSlots } = useTimeSlots();

  const handleExportDay = () => {
    if (!timeSlots) return;
    
    // Розраховуємо дату для поточного дня тижня
    const today = dayjs();
    const startOfWeek = today.startOf('week').add(1, 'day'); // Понеділок
    const targetDate = startOfWeek.add(dayIndex, 'day').toDate();
    
    openGoogleCalendarForDay(daySchedule, timeSlots, targetDate);
  };

  const hasSchedule = daySchedule.some(pair => pair !== null);

  return (
    <WeekDayContainer>
      <DayTitle>{children}</DayTitle>
      {hasSchedule && (
        <GoogleCalendarButton onClick={handleExportDay} size="sm">
          День
        </GoogleCalendarButton>
      )}
    </WeekDayContainer>
  );
};

export default WeekDayWithExport;
