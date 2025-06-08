import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SidebarCalendar from '../SideBarCalendar';
import '@testing-library/jest-dom';
import * as utils from '../utils';
import type { Appointment, RawAppointment } from '../types';

// Mock DayView simplified
jest.mock('../DayView', () => (props: { appointments?: Appointment[] }) => (
  <div data-testid="day-view">Mocked DayView - {props.appointments?.length ?? 0} appointments</div>
));

// Mock parseAppointments to just convert date strings to Date objects
jest
  .spyOn(utils, 'parseAppointments')
  .mockImplementation((data: RawAppointment | RawAppointment[]) => {
    const raws = Array.isArray(data) ? data : [data];
    return raws.map((raw) => ({
      id: Number(raw.id),
      title: raw.title,
      start_datetime: new Date(raw.start_datetime),
      end_datetime: new Date(raw.end_datetime),
      participants: raw.participants,
      employee: raw.employee,
    }));
  });

// Mock config
jest.mock('../constants', () => ({
  default: {
    APPOINTMENT_ENDPOINT: 'http://localhost/api/appointments',
  },
}));

const mockClosestAppointment = {
  id: 42,
  title: 'Closest Appointment',
  start_datetime: new Date('2025-06-15T10:00:00Z').toISOString(),
  end_datetime: new Date('2025-06-15T11:00:00Z').toISOString(),
  participants: [],
  employee: null,
};

const mockAppointments: Appointment[] = [
  {
    id: 1,
    title: 'Test',
    start_datetime: new Date(),
    end_datetime: new Date(),
    participants: [],
    employee: null,
  },
];

// Helper to return different mock fetch responses by URL
function mockFetch(url: string) {
  if (url.endsWith('/closest/')) {
    return Promise.resolve({
      ok: true,
      json: async () => mockClosestAppointment,
    } as Response);
  }
  if (url.includes('?date=')) {
    return Promise.resolve({
      ok: true,
      json: async () => mockAppointments,
    } as Response);
  }
  return Promise.resolve({ ok: false } as Response);
}

beforeEach(() => {
  global.fetch = jest.fn((input: RequestInfo) => {
    const url = typeof input === 'string' ? input : input.url;
    return mockFetch(url);
  }) as jest.Mock;
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('fetches closest appointment date and sets it as selectedDate', async () => {
  render(<SidebarCalendar />);

  // Wait until DayView displays the expected appointment count
  await waitFor(() => {
    expect(screen.getByTestId('day-view')).toHaveTextContent('Mocked DayView - 1 appointments');
  });
});

test('clicking next and previous day changes date and triggers fetch', async () => {
  render(<SidebarCalendar />);

  // Clear fetch mock call count to only count clicks
  (global.fetch as jest.Mock).mockClear();

  const prevButton = screen.getByLabelText('Previous day');
  const nextButton = screen.getByLabelText('Next day');

  fireEvent.click(nextButton);
  fireEvent.click(prevButton);
  fireEvent.click(prevButton);

  // Expect exactly 3 fetch calls for the 3 clicks
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });
});

test('selecting a date via datepicker triggers fetch', async () => {
  render(<SidebarCalendar />);

  // Simulate date selection in the datepicker input
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '2025-06-20' } });

  await waitFor(() =>
    expect(screen.getByTestId('day-view')).toHaveTextContent('Mocked DayView - 1 appointments')
  );
});
