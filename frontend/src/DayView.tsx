import { useState, useEffect } from 'react';
import type { Appointment, Department } from './types';
import AppointmentItem from './AppointmentItem';
import { calculatePosition, groupOverlappingAppointments } from './utils';
import config from './constants';

interface Props {
  date: Date;
  appointments: Appointment[];
}

export default function DayView({ date, appointments }: Props) {
  const startHour = 0;
  const endHour = 24;
  const [departments, setDepartments] = useState<Department[]>([]);
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>(appointments);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    fetch(`${config.DEPARTMENT_ENDPOINT}/`)
      .then((res) => res.json())
      .then(setDepartments)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLocalAppointments(appointments);
  }, [appointments]);

  const dailyAppointments = groupOverlappingAppointments(localAppointments);

  const handleDeleteAppointment = (deletedAppointmentId: number) => {
    setLocalAppointments((prev) => prev.filter((a) => a.id !== deletedAppointmentId));
    if (editingAppointment && editingAppointment.id === deletedAppointmentId) {
      setEditingAppointment(null);
    }
  };

  const handleNewAppointment = () => {
    const newAppointment: Appointment = {
      id: -1,
      title: '',
      start_datetime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 0),
      end_datetime: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0),
      participants: [],
    };
    setEditingAppointment(newAppointment);
  };

  const handleSaveAppointment = (savedAppointment: Appointment) => {
    setLocalAppointments((prev) => {
      const exists = prev.find((a) => a.id === savedAppointment.id);
      if (exists) {
        return prev.map((a) => (a.id === savedAppointment.id ? savedAppointment : a));
      }
      return [...prev, savedAppointment];
    });
    setEditingAppointment(null);
  };

  return (
    <>
      <div className="relative h-full border rounded-lg overflow-y-auto bg-gray-50 flex flex-col">
        <div className="flex flex-1">
          <div className="w-14 flex flex-col border-r border-gray-300 select-none">
            {[...Array(endHour - startHour)].map((_, i) => (
              <div
                key={i}
                className="h-20 flex items-start justify-end pr-2 text-xs text-gray-500 font-mono"
              >
                {`${startHour + i}:00`}
              </div>
            ))}
          </div>

          <div
            className="relative flex-1"
            style={{ minWidth: 0, height: config.HOUR_HEIGHT_PX * (endHour - startHour) }}
          >
            {[...Array(endHour - startHour)].map((_, i) => (
              <div
                key={i}
                className="border-b border-gray-200 absolute left-0 right-0"
                style={{ top: i * config.HOUR_HEIGHT_PX, height: 0 }}
              />
            ))}

            {dailyAppointments.map(([appointment, ...overLappedAppointments]) => {
              const { top, height } = calculatePosition(
                appointment.start_datetime,
                appointment.end_datetime,
                date,
                config.HOUR_HEIGHT_PX
              );

              return (
                <AppointmentItem
                  key={appointment.id}
                  appointment={appointment}
                  overLappedAppointments={overLappedAppointments}
                  departments={departments}
                  top={top}
                  height={height}
                  onSave={handleSaveAppointment}
                  onDelete={handleDeleteAppointment}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-2 border-t flex justify-end">
        <button
          onClick={handleNewAppointment}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          New Appointment
        </button>
      </div>

      {editingAppointment && (
        <AppointmentItem
          key={editingAppointment.id}
          appointment={editingAppointment}
          overLappedAppointments={[]}
          departments={departments}
          top={0}
          height={0}
          initialShowPopup={true}
          onClose={() => setEditingAppointment(null)}
          onSave={handleSaveAppointment}
          onDelete={handleDeleteAppointment}
        />
      )}
    </>
  );
}
