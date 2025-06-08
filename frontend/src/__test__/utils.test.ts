import type { Appointment, RawAppointment, Employee } from '../types';
import {
  parseAppointment,
  parseAppointments,
  groupOverlappingAppointments,
  calculatePosition,
} from '../utils';

const mockEmployee: Employee = {
  id: 1,
  url: '/api/employees/1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  department: {
    id: 10,
    url: '/api/departments/10',
    name: 'Engineering',
    manager: 'Jane Smith',
  },
};

describe('parseAppointment', () => {
  it('parses a RawAppointment into Appointment with correct types', () => {
    const raw: RawAppointment = {
      id: '1',
      start_datetime: '2025-06-07T10:00:00Z',
      end_datetime: '2025-06-07T11:00:00Z',
      title: 'Test',
      employee: mockEmployee,
      participants: [],
    };
    const parsed: Appointment = parseAppointment(raw);
    expect(parsed.id).toBe(1);
    expect(parsed.start_datetime).toBeInstanceOf(Date);
    expect(parsed.end_datetime).toBeInstanceOf(Date);
    expect(parsed.title).toBe('Test');
  });
});

describe('parseAppointments', () => {
  it('parses single RawAppointment wrapped in array', () => {
    const raw: RawAppointment = {
      id: '1',
      start_datetime: '2025-06-07T10:00:00Z',
      end_datetime: '2025-06-07T11:00:00Z',
      title: 'Test',
      employee: mockEmployee,
      participants: [],
    };
    const result: Appointment[] = parseAppointments(raw);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('parses array of RawAppointments', () => {
    const raws: RawAppointment[] = [
      {
        id: '1',
        start_datetime: '2025-06-07T10:00:00Z',
        end_datetime: '2025-06-07T11:00:00Z',
        title: 'Test 1',
        employee: mockEmployee,
        participants: [],
      },
      {
        id: '2',
        start_datetime: '2025-06-07T11:30:00Z',
        end_datetime: '2025-06-07T12:00:00Z',
        title: 'Test 2',
        employee: mockEmployee,
        participants: [],
      },
    ];
    const result: Appointment[] = parseAppointments(raws);
    expect(result).toHaveLength(2);
    expect(result[1].id).toBe(2);
  });
});

describe('groupOverlappingAppointments', () => {
  it('groups overlapping appointments correctly', () => {
    const appointments: Appointment[] = [
      {
        id: 1,
        start_datetime: new Date(Date.UTC(2025, 5, 7, 10, 0, 0)),
        end_datetime: new Date(Date.UTC(2025, 5, 7, 11, 0, 0)),
        title: 'A',
        participants: [],
      },
      {
        id: 2,
        start_datetime: new Date(Date.UTC(2025, 5, 7, 10, 30, 0)),
        end_datetime: new Date(Date.UTC(2025, 5, 7, 11, 30, 0)),
        title: 'B',
        participants: [],
      },
      {
        id: 3,
        start_datetime: new Date(Date.UTC(2025, 5, 7, 12, 0, 0)),
        end_datetime: new Date(Date.UTC(2025, 5, 7, 13, 0, 0)),
        title: 'C',
        participants: [],
      },
    ];
    const groups = groupOverlappingAppointments(appointments);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveLength(2); // A and B overlap
    expect(groups[1]).toHaveLength(1); // C alone
  });
});

describe('calculatePosition', () => {
  const hourHeight = 80; // px per hour

  it('calculates correct top and height for appointments within the same day', () => {
    const start = new Date(Date.UTC(2025, 5, 7, 10, 15, 0)); // 2025-06-07T10:15:00Z UTC
    const end = new Date(Date.UTC(2025, 5, 7, 11, 45, 0)); // 2025-06-07T11:45:00Z UTC
    const currentDate = new Date(Date.UTC(2025, 5, 7, 0, 0, 0)); // 2025-06-07T00:00:00Z UTC

    const pos = calculatePosition(start, end, currentDate, hourHeight);

    expect(pos.top).toBeCloseTo(10.25 * hourHeight);
    expect(pos.height).toBeCloseTo(1.5 * hourHeight);
  });

  it('returns top=0 if appointment starts on different day', () => {
    const start = new Date(Date.UTC(2025, 5, 6, 23, 0, 0)); // 2025-06-06T23:00:00Z UTC
    const end = new Date(Date.UTC(2025, 5, 7, 1, 0, 0)); // 2025-06-07T01:00:00Z UTC
    const currentDate = new Date(Date.UTC(2025, 5, 7, 0, 0, 0)); // 2025-06-07T00:00:00Z UTC

    const pos = calculatePosition(start, end, currentDate, hourHeight);
    expect(pos.top).toBe(0);
  });

  it('returns height as full day if appointment ends on different day', () => {
    const currentDate = new Date(Date.UTC(2025, 5, 8, 0, 0, 0)); // 2025-06-07T00:00:00Z UTC
    const start = new Date(Date.UTC(2025, 5, 7, 22, 0, 0)); // 2025-06-07T22:00:00Z UTC
    const end = new Date(Date.UTC(2025, 5, 9, 2, 0, 0)); // 2025-06-08T01:00:00Z UTC

    const pos = calculatePosition(start, end, currentDate, hourHeight);
    expect(pos.height).toBeCloseTo(24 * hourHeight);
  });
});
