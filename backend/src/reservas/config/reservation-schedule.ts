/** Operating hours and block sizes — shared by availability API and validation. */
export const RESERVATION_OPEN_HOUR = 8;
export const RESERVATION_CLOSE_HOUR = 22;

export const RESERVATION_BLOCK_HOURS: Record<string, number> = {
  'Salão de Festas': 5,
  'Churrasqueira 1': 5,
  'Churrasqueira 2': 5,
  'Quadra Esportiva': 1,
  'Área da Piscina': 1,
};

export interface ScheduleSlot {
  startTime: string;
  endTime: string;
  label: string;
}

export interface ScheduleSlotAvailability extends ScheduleSlot {
  available: boolean;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function buildScheduleSlots(space: string): ScheduleSlot[] {
  const duration = RESERVATION_BLOCK_HOURS[space] ?? 1;
  const slots: ScheduleSlot[] = [];

  for (let hour = RESERVATION_OPEN_HOUR; hour + duration <= RESERVATION_CLOSE_HOUR; hour++) {
    const startTime = `${pad(hour)}:00`;
    const endTime = `${pad(hour + duration)}:00`;
    slots.push({
      startTime,
      endTime,
      label: `${startTime} – ${endTime}`,
    });
  }

  return slots;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes ?? 0);
}

export function slotsOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  const aStartMin = timeToMinutes(aStart);
  const aEndMin = timeToMinutes(aEnd);
  const bStartMin = timeToMinutes(bStart);
  const bEndMin = timeToMinutes(bEnd);
  return aStartMin < bEndMin && aEndMin > bStartMin;
}

export function startOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export function endOfDay(date: Date): Date {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}
