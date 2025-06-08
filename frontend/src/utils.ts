import type { Appointment, RawAppointment } from './types';

export function parseAppointment(item: RawAppointment): Appointment {
  return {
    ...item,
    id: Number(item.id),
    start_datetime: new Date(item.start_datetime),
    end_datetime: new Date(item.end_datetime),
  };
}

export function parseAppointments(data: RawAppointment | RawAppointment[]): Appointment[] {
  if (Array.isArray(data)) {
    return data.map(parseAppointment);
  }
  return [parseAppointment(data)];
}

function isOverlapping(a: Appointment, b: Appointment): boolean {
  return a.start_datetime < b.end_datetime && b.start_datetime < a.end_datetime;
}

export function groupOverlappingAppointments(appointments: Appointment[]): Appointment[][] {
  const sorted = [...appointments].sort(
    (a, b) => a.start_datetime.getTime() - b.start_datetime.getTime()
  );
  const groups: Appointment[][] = [];

  for (const appointment of sorted) {
    let placed = false;
    for (const group of groups) {
      if (group.some((a) => isOverlapping(a, appointment))) {
        group.push(appointment);
        placed = true;
        break;
      }
    }
    if (!placed) {
      groups.push([appointment]);
    }
  }

  return groups;
}

export function calculatePosition(start: Date, end: Date, currentDate: Date, hourHeight: number) {
  const startHour = getClampedStartHour(start, end, currentDate);
  const endHour = getClampedEndHour(start, end, currentDate);

  const top = startHour * hourHeight;
  const height = (endHour - startHour) * hourHeight;

  return { top, height };
}

function getClampedStartHour(start: Date, end: Date, current: Date): number {
  if (!isSameDayUTC(start, current)) return 0;
  return start.getUTCHours() + start.getUTCMinutes() / 60;
}

function getClampedEndHour(start: Date, end: Date, current: Date): number {
  if (!isSameDayUTC(end, current)) return 24;
  return end.getUTCHours() + end.getUTCMinutes() / 60;
}

function isSameDayUTC(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}
