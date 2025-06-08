import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DayView from '../DayView';
import type { Appointment, Department } from '../types';

const mockDate = new Date(2025, 5, 8); // 2025-06-08

const mockAppointments: Appointment[] = [
  {
    id: 1,
    title: 'Meeting',
    start_datetime: new Date(2025, 5, 8, 9, 0),
    end_datetime: new Date(2025, 5, 8, 10, 0),
    participants: [],
  },
  {
    id: 2,
    title: 'Lunch',
    start_datetime: new Date(2025, 5, 8, 12, 0),
    end_datetime: new Date(2025, 5, 8, 13, 0),
    participants: [],
  },
];

const mockDepartments: Department[] = [
  { id: 1, url: '/dept/1', name: 'Dept 1', manager: 'Manager 1' },
];

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockDepartments),
    } as Response)
  ) as jest.Mock;
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders hours 0 to 23', async () => {
  render(<DayView date={mockDate} appointments={[]} />);
  // Use waitFor to ensure React has completed rendering
  await waitFor(() => {
    for (let hour = 0; hour < 24; hour++) {
      expect(screen.getByText(`${hour}:00`)).toBeInTheDocument();
    }
  });
});

test('fetches and displays departments', async () => {
  render(<DayView date={mockDate} appointments={[]} />);
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('department'));
  });
});

test('displays appointments on the day', async () => {
  render(<DayView date={mockDate} appointments={mockAppointments} />);

  expect(await screen.findByText('Meeting')).toBeInTheDocument();
  expect(await screen.findByText('Lunch')).toBeInTheDocument();
});

test('clicking New Appointment opens a new AppointmentItem popup', async () => {
  render(<DayView date={mockDate} appointments={[]} />);

  const newBtn = await screen.findByRole('button', { name: /new appointment/i });
  fireEvent.click(newBtn);

  expect(await screen.findByTestId('appointment-form')).toBeInTheDocument();
});

test('saving a new appointment adds it to the list (simulation)', async () => {
  // Start with empty appointment list
  const { rerender } = render(<DayView date={mockDate} appointments={[]} />);

  fireEvent.click(await screen.findByRole('button', { name: /new appointment/i }));

  // Simulate "save" by rerendering component with new props (state lifting workaround)
  const newAppointment: Appointment = {
    id: 123,
    title: 'New Meeting',
    start_datetime: new Date(2025, 5, 8, 14, 0),
    end_datetime: new Date(2025, 5, 8, 15, 0),
    participants: [],
  };

  rerender(<DayView date={mockDate} appointments={[newAppointment]} />);

  expect(await screen.findByText('New Meeting')).toBeInTheDocument();
});

test('deleting an appointment removes it from the list (simulation)', async () => {
  const { rerender } = render(<DayView date={mockDate} appointments={[...mockAppointments]} />);

  expect(await screen.findByText('Meeting')).toBeInTheDocument();

  // Simulate deletion by rerendering without the deleted item
  rerender(<DayView date={mockDate} appointments={[mockAppointments[1]]} />); // only 'Lunch'

  await waitFor(() => {
    expect(screen.queryByText('Meeting')).not.toBeInTheDocument();
  });
});
