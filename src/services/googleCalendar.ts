import { StudentPair } from '../models/StudentPair';
import { Pair } from '../models/Pair';
import dayjs from 'dayjs';

export interface CalendarEvent {
  title: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  description?: string;
}

/**
 * Визначає дату найближчого дня тижня
 * @param dayOfWeek - день тижня (0 = неділя, 1 = понеділок, ..., 6 = субота)
 * @returns дата найближчого дня тижня
 */
export const getNextDateForDayOfWeek = (dayOfWeek: number): Date => {
  const today = dayjs();
  const currentDayOfWeek = today.day(); // 0 = неділя, 1 = понеділок, ..., 6 = субота
  
  let daysToAdd = dayOfWeek - currentDayOfWeek;
  
  // Якщо день вже пройшов цього тижня, переходимо на наступний тиждень
  if (daysToAdd < 0) {
    daysToAdd += 7;
  }
  
  // Якщо це сьогодні, але час пари вже пройшов, переходимо на наступний тиждень
  if (daysToAdd === 0) {
    // Можна додати логіку перевірки часу, поки що просто переходимо на наступний тиждень
    daysToAdd = 7;
  }
  
  return today.add(daysToAdd, 'day').toDate();
};

/**
 * Перетворює пару в подію календаря
 */
export const pairToCalendarEvent = (
  pair: StudentPair,
  date: Date,
  timeSlot: string,
): CalendarEvent => {
  // Перевіряємо та конвертуємо формат часу
  let processedTimeSlot = timeSlot;
  
  // Якщо timeSlot у форматі HH:MM:SS, конвертуємо в діапазон
  if (timeSlot && timeSlot.includes(':') && !timeSlot.includes('-')) {
    const timeParts = timeSlot.split(':');
    const startHour = parseInt(timeParts[0], 10);
    const startMinute = parseInt(timeParts[1], 10);
    
    const startTime = dayjs().hour(startHour).minute(startMinute);
    const endTime = startTime.add(1, 'hour').add(35, 'minute');
    
    processedTimeSlot = `${startTime.format('HH:mm')}-${endTime.format('HH:mm')}`;
    console.log(`Converted timeSlot from "${timeSlot}" to "${processedTimeSlot}"`);
  }
  
  // Якщо все ще немає правильного формату, використовуємо дефолт
  if (!processedTimeSlot || !processedTimeSlot.includes('-')) {
    console.warn('Invalid timeSlot format:', timeSlot);
    const defaultStartTime = dayjs(date).hour(8).minute(30);
    const defaultEndTime = defaultStartTime.add(1, 'hour').add(35, 'minute');
    
    return {
      title: `${pair.name} (${pair.type})`,
      startDate: defaultStartTime.toDate(),
      endDate: defaultEndTime.toDate(),
      location: pair.location?.title,
      description: [
        pair.lecturer ? `Викладач: ${pair.lecturer.name}` : '',
        pair.location ? `Аудиторія: ${pair.location.title}` : '',
        pair.dates.length > 0 ? `Дати: ${pair.dates.join(', ')}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    };
  }

  // Парсимо час з processedTimeSlot (наприклад, "08:30-10:05")
  const [startTime, endTime] = processedTimeSlot.split('-');
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  const startDate = dayjs(date)
    .hour(startHour)
    .minute(startMinute)
    .second(0)
    .millisecond(0)
    .toDate();

  const endDate = dayjs(date)
    .hour(endHour)
    .minute(endMinute)
    .second(0)
    .millisecond(0)
    .toDate();

  const description = [
    pair.lecturer ? `Викладач: ${pair.lecturer.name}` : '',
    pair.location ? `Аудиторія: ${pair.location.title}` : '',
    pair.dates.length > 0 ? `Дати: ${pair.dates.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    title: `${pair.name} (${pair.type})`,
    startDate,
    endDate,
    location: pair.location?.title,
    description,
  };
};

/**
 * Форматує дату для Google Calendar URL
 */
const formatDateForGoogle = (date: Date): string => {
  return dayjs(date).format('YYYYMMDDTHHmmss');
};

/**
 * Генерує URL для додавання події в Google Calendar
 */
export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
  const baseUrl = 'https://calendar.google.com/calendar/render';
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatDateForGoogle(event.startDate)}/${formatDateForGoogle(event.endDate)}`,
    details: event.description || '',
    location: event.location || '',
  });

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Відкриває Google Calendar з подією
 */
export const openGoogleCalendar = (event: CalendarEvent): void => {
  const url = generateGoogleCalendarUrl(event);
  window.open(url, '_blank');
};

/**
 * Генерує події для цілого дня
 */
export const generateDayEvents = (
  daySchedule: (StudentPair | null)[],
  timeSlots: string[],
  date: Date,
): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  daySchedule.forEach((pair, index) => {
    if (pair && timeSlots[index]) {
      events.push(pairToCalendarEvent(pair, date, timeSlots[index]));
    }
  });

  return events;
};

/**
 * Відкриває Google Calendar з множинними подіями для дня
 */
export const openGoogleCalendarForDay = (
  daySchedule: (StudentPair | null)[],
  timeSlots: string[],
  date: Date,
): void => {
  const events = generateDayEvents(daySchedule, timeSlots, date);
  
  // Відкриваємо кожну подію в окремій вкладці
  events.forEach((event, index) => {
    setTimeout(() => {
      openGoogleCalendar(event);
    }, index * 100); // Невелика затримка між відкриттям вкладок
  });
};

/**
 * Генерує події для тижня
 */
export const generateWeekEvents = (
  weekSchedule: (StudentPair | null)[][],
  timeSlots: string[],
  weekStartDate: Date,
): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  weekSchedule.forEach((daySchedule, dayIndex) => {
    const currentDate = dayjs(weekStartDate).add(dayIndex, 'day').toDate();
    const dayEvents = generateDayEvents(daySchedule, timeSlots, currentDate);
    events.push(...dayEvents);
  });

  return events;
};

/**
 * Відкриває Google Calendar з подіями для тижня
 */
export const openGoogleCalendarForWeek = (
  weekSchedule: (StudentPair | null)[][],
  timeSlots: string[],
  weekStartDate: Date,
): void => {
  const events = generateWeekEvents(weekSchedule, timeSlots, weekStartDate);
  
  // Відкриваємо події пакетами по 5 для уникнення блокування браузером
  const batchSize = 5;
  for (let i = 0; i < events.length; i += batchSize) {
    const batch = events.slice(i, i + batchSize);
    setTimeout(() => {
      batch.forEach((event, index) => {
        setTimeout(() => {
          openGoogleCalendar(event);
        }, index * 100);
      });
    }, (i / batchSize) * 1000);
  }
};
