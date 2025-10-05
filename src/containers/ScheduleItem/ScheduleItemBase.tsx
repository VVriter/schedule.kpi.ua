import { SUBJECT_TYPES } from '../../common/constants/subjectTypes';
import { Pair } from '../../models/Pair';
import { StudentPair } from '../../models/StudentPair';

import styled from 'styled-components';
import { Flex } from '../../common/styles/styles';
import { getValueFromTheme } from '../../common/utils/getValueFromTheme';
import SubjectTypeBadge from '../../components/SubjectTypeBadge';
import GoogleCalendarButton from '../../components/GoogleCalendarButton';
import { ScheduleMatrixCell } from '../../types/ScheduleMatrix';
import { pairToCalendarEvent, openGoogleCalendar, getNextDateForDayOfWeek } from '../../services/googleCalendar';
import { useTimeSlots } from '../../queries/useTimeSlots';
import dayjs from 'dayjs';

const Subject = styled.div`
  font-weight: bold;
  font-size: 14px;
  line-height: 17px;
  color: ${getValueFromTheme('primaryFontColor')};
  margin-top: 12px;
`;

const ScheduleItemHeader = styled(Flex)`
  gap: 25px;
  align-items: center;
  justify-content: space-between;
`;

const ScheduleItemCurrent = styled.span`
  position: relative;
  font-weight: bold;
  font-size: 12px;
  color: #25cf9c;
  text-transform: uppercase;

  &:before {
    content: '';
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: -13px;
    display: block;
    background-color: #25cf9c;
    border-radius: 50%;
    width: 8px;
    height: 8px;
  }
`;

const CollapsedItemsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
`;

interface Props<T extends Pair> {
  scheduleMatrixCell: ScheduleMatrixCell<T>;
  collapsed?: boolean;
  children: React.ReactNode;
  dayIndex?: number; // 0 = понеділок, 1 = вівторок, ..., 5 = субота
}

const ScheduleItemBase = <T extends Pair>({ scheduleMatrixCell, collapsed, children, dayIndex }: Props<T>) => {
  const {
    pair: { name, tag, dates, time },
  } = scheduleMatrixCell;
  
  const { data: timeSlots } = useTimeSlots();

  const handleExportToCalendar = () => {
    if (!timeSlots || !isStudentPair(scheduleMatrixCell.pair)) return;
    
    // Знаходимо відповідний timeSlot для поточної пари
    // Спочатку пробуємо знайти точний збіг
    let matchingTimeSlot = timeSlots.find(slot => slot === time);
    
    // Якщо не знайшли точний збіг, використовуємо перший доступний або сам time
    if (!matchingTimeSlot) {
      console.warn('TimeSlot not found for time:', time, 'Available slots:', timeSlots);
      matchingTimeSlot = time || timeSlots[0] || '08:30-10:05';
    }

    // Визначаємо правильну дату на основі дня тижня
    let targetDate: Date;
    if (dayIndex !== undefined) {
      // Конвертуємо dayIndex (0-5) в dayjs day (1-6, де 1 = понеділок)
      const dayOfWeek = dayIndex + 1;
      targetDate = getNextDateForDayOfWeek(dayOfWeek);
    } else {
      // Fallback на сьогоднішню дату, якщо dayIndex не передано
      targetDate = dayjs().toDate();
    }
    
    const event = pairToCalendarEvent(
      scheduleMatrixCell.pair,
      targetDate,
      matchingTimeSlot
    );
    
    openGoogleCalendar(event);
  };

  const isStudentPair = (pair: Pair): pair is StudentPair => {
    return 'lecturer' in pair;
  };

  return (
    <>
      <ScheduleItemHeader>
        <SubjectTypeBadge type={tag} dates={dates}>
          {SUBJECT_TYPES[tag]}
        </SubjectTypeBadge>
        <Flex style={{ gap: '8px', alignItems: 'center' }}>
          {isStudentPair(scheduleMatrixCell.pair) && (
            <GoogleCalendarButton onClick={handleExportToCalendar}>
              Календар
            </GoogleCalendarButton>
          )}
          {scheduleMatrixCell.currentPair && <ScheduleItemCurrent>Зараз</ScheduleItemCurrent>}
        </Flex>
      </ScheduleItemHeader>
      <Subject>{name}</Subject>
      {!collapsed && <CollapsedItemsWrapper>{children}</CollapsedItemsWrapper>}
    </>
  );
};

export default ScheduleItemBase;
