import { Pair } from '../models/Pair';
import { ScheduleMatrixCell } from './ScheduleMatrix';

export interface ScheduleItemProps<T extends Pair> {
  scheduleMatrixCell: ScheduleMatrixCell<T>;
  collapsed?: boolean;
  dayIndex?: number; // 0 = понеділок, 1 = вівторок, ..., 5 = субота
}

export interface ExtendedScheduleItemProps<T extends Pair> {
  scheduleMatrixCell: ScheduleMatrixCell<T>[];
  dayIndex?: number; // 0 = понеділок, 1 = вівторок, ..., 5 = субота
}

export interface ScheduleComponentsProps<T extends Pair> {
  baseComponent: React.ComponentType<ScheduleItemProps<T>>;
  baseComponentExtended: React.ComponentType<ExtendedScheduleItemProps<T>>;
}
