import { Pair } from '../../models/Pair';
import { ScheduleMatrixCell } from '../../types/ScheduleMatrix';

export interface ExtendedScheduleItemProps<T extends Pair> {
  scheduleMatrixCell: ScheduleMatrixCell<T>[];
  dayIndex?: number; // 0 = понеділок, 1 = вівторок, ..., 5 = субота
}
