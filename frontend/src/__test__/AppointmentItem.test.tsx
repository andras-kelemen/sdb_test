import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppointmentItem from '../AppointmentItem';
import type { Appointment, Department, Employee } from '../types';

const mockDepartments: Department[] = [
  { id: 1, url: '/dept/1', name: 'Dept 1', manager: 'Manager 1' },
  { id: 2, url: '/dept/2', name: 'Dept 2', manager: 'Manager 2' },
];

const mockEmployees: Employee[] = [
  { id: 1, url: '/emp/1', name: 'Alice', email: 'alice@test.com', department: mockDepartments[0] },
  { id: 2, url: '/emp/2', name: 'Bob', email: 'bob@test.com', department: mockDepartments[1] },
];

const mockAppointment: Appointment = {
  id: 1,
  title: 'Test Appointment',
  start_datetime: new Date('2025-06-07T10:00:00Z'),
  end_datetime: new Date('2025-06-07T11:00:00Z'),
  participants: [mockEmployees[0]],
};

beforeEach(() => {
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  jest.spyOn(window, 'confirm').mockImplementation(() => true);
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
  (global.fetch as jest.Mock).mockClear();
});

test('popup opens on click and closes on cancel button', () => {
  render(
    <AppointmentItem
      appointment={mockAppointment}
      overLappedAppointments={[]}
      departments={mockDepartments}
      top={0}
      height={60}
    />
  );

  // Popup should not be visible initially
  expect(screen.queryByRole('form')).not.toBeInTheDocument();

  // Clicking the title should open the popup
  fireEvent.click(screen.getByText('Test Appointment'));
  expect(screen.getByTestId('appointment-form')).toBeInTheDocument();

  // Clicking the Cancel button should close the popup
  fireEvent.click(screen.getByText('Cancel'));
  expect(screen.queryByTestId('appointment-form')).not.toBeInTheDocument();
});

test('shows alert when start date is not before end date', async () => {
  render(
    <AppointmentItem
      appointment={mockAppointment}
      overLappedAppointments={[]}
      departments={mockDepartments}
      top={0}
      height={60}
    />
  );

  fireEvent.click(screen.getByText('Test Appointment'));

  const startInput = screen.getByLabelText('Start date');
  const endInput = screen.getByLabelText('End date');
  const saveButton = screen.getByText('Save');

  fireEvent.change(startInput, { target: { value: '2025-06-07T12:00' } });
  fireEvent.change(endInput, { target: { value: '2025-06-07T11:00' } });

  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Start time must be before end time.');
  });
});

test('calls onSave on successful appointment save (POST)', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      id: 2,
      title: 'Saved Appointment',
      start_datetime: '2025-06-07T10:00:00Z',
      end_datetime: '2025-06-07T11:00:00Z',
      participants: [],
      employee: null,
    }),
  });

  const onSave = jest.fn();

  render(
    <AppointmentItem
      appointment={{ ...mockAppointment, id: 0 }} // new appointment - POST
      overLappedAppointments={[]}
      departments={mockDepartments}
      top={0}
      height={60}
      onSave={onSave}
    />
  );

  fireEvent.click(screen.getByText('Test Appointment'));

  const saveButton = screen.getByText('Save');
  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(onSave).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Appointment saved successfully.');
  });
});

test('calls onSave on successful appointment update (PUT)', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      id: 1,
      title: 'Updated Appointment',
      start_datetime: '2025-06-07T10:00:00Z',
      end_datetime: '2025-06-07T11:00:00Z',
      participants: [],
      employee: null,
    }),
  });

  const onSave = jest.fn();

  render(
    <AppointmentItem
      appointment={mockAppointment} // existing appointment - PUT
      overLappedAppointments={[]}
      departments={mockDepartments}
      top={0}
      height={60}
      onSave={onSave}
    />
  );

  fireEvent.click(screen.getByText('Test Appointment'));

  const saveButton = screen.getByText('Save');
  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(onSave).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Appointment saved successfully.');
  });
});

test('shows alert on failed save', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
  });

  render(
    <AppointmentItem
      appointment={{ ...mockAppointment, id: 0 }}
      overLappedAppointments={[]}
      departments={mockDepartments}
      top={0}
      height={60}
    />
  );

  fireEvent.click(screen.getByText('Test Appointment'));
  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Failed to save appointment.');
  });
});

test('handles delete confirmation and calls onDelete', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
  });

  const onDelete = jest.fn();

  render(
    <AppointmentItem
      appointment={mockAppointment}
      overLappedAppointments={[]}
      departments={mockDepartments}
      top={0}
      height={60}
      onDelete={onDelete}
    />
  );

  fireEvent.click(screen.getByText('Test Appointment'));
  fireEvent.click(screen.getByText('Delete'));

  await waitFor(() => {
    expect(window.confirm).toHaveBeenCalled();
    expect(onDelete).toHaveBeenCalledWith(mockAppointment.id);
    expect(window.alert).toHaveBeenCalledWith('Appointment deleted successfully.');
  });
});

test('shows alert on failed delete', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
  });

  render(
    <AppointmentItem
      appointment={mockAppointment}
      overLappedAppointments={[]}
      departments={mockDepartments}
      top={0}
      height={60}
    />
  );

  fireEvent.click(screen.getByText('Test Appointment'));
  fireEvent.click(screen.getByText('Delete'));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Failed to delete appointment.');
  });
});

test('adds participants after selecting a department and clicking add participant', async () => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => mockEmployees,
  });

  render(
    <AppointmentItem
      appointment={mockAppointment}
      overLappedAppointments={[]}
      departments={mockDepartments}
      top={0}
      height={60}
    />
  );

  fireEvent.click(screen.getByText('Test Appointment'));

  // Select department
  fireEvent.change(screen.getByLabelText('Department'), { target: { value: '1' } });

  const addParticipantBtn = screen.getByText('Add Participant');
  fireEvent.click(addParticipantBtn);

  // Wait for employee list to appear
  expect(await screen.findByText('Alice')).toBeInTheDocument();
  expect(await screen.findByText('Bob')).toBeInTheDocument();

  // Click to add Bob as a participant
  fireEvent.click(screen.getByText('Bob'));

  // Bob should now be listed as a participant
  expect(screen.getAllByText('Bob').length).toBeGreaterThan(1);

  // Remove button should work
  const removeBtn = screen
    .getAllByLabelText('Remove participant')
    .find((btn) => btn.parentElement?.textContent?.includes('Bob'));
  expect(removeBtn).toBeDefined();

  if (removeBtn) {
    fireEvent.click(removeBtn);
    expect(screen.getAllByText('Bob').length).toBe(1);
  }
});

test('displays overlap count when there are overlapping appointments', () => {
  render(
    <AppointmentItem
      appointment={mockAppointment}
      overLappedAppointments={[mockAppointment, mockAppointment]}
      departments={mockDepartments}
      top={0}
      height={60}
    />
  );

  expect(screen.getByText('+2')).toBeInTheDocument();
});
