import React, { useState, useEffect, useRef } from 'react';
import type { Appointment, Department, Employee } from './types';
import config from './constants';
import { parseAppointment } from './utils';

interface Props {
  appointment: Appointment;
  overLappedAppointments: Appointment[];
  departments: Department[];
  top: number;
  height: number;
  initialShowPopup?: boolean;
  onClose?: () => void;
  onSave?: (savedAppointment: Appointment) => void;
  onDelete?: (deletedAppointmentId: number) => void;
}

export default function AppointmentItem({
  appointment,
  overLappedAppointments,
  departments,
  top,
  height,
  initialShowPopup = false,
  onSave,
  onClose,
  onDelete,
}: Props) {
  const [showPopup, setShowPopup] = useState(!!initialShowPopup);
  const [showEmployeeList, setShowEmployeeList] = useState(false);

  const [title, setTitle] = useState(appointment.title);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [start, setStart] = useState(appointment.start_datetime.toISOString().slice(0, 16));
  const [end, setEnd] = useState(appointment.end_datetime.toISOString().slice(0, 16));
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>(
    appointment.participants || []
  );
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  const popupRef = useRef<HTMLFormElement>(null);
  const employeeListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node | null;

      if (popupRef.current && target && !popupRef.current.contains(target)) {
        closePopup();
      } else if (
        employeeListRef.current &&
        target &&
        !employeeListRef.current.contains(target) &&
        popupRef.current &&
        popupRef.current.contains(target)
      ) {
        setShowEmployeeList(false);
      }
    }

    if (showPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopup]);

  const closePopup = () => {
    setShowPopup(false);
    setShowEmployeeList(false);
    if (onClose) onClose();
  };

  const togglePopup = () => {
    setShowPopup((prev) => !prev);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const response = await fetch(`${config.APPOINTMENT_ENDPOINT}/${appointment.id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete appointment.');
      }

      alert('Appointment deleted successfully.');

      if (onDelete) {
        onDelete(appointment.id);
      }

      closePopup();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (new Date(start) >= new Date(end)) {
      alert('Start time must be before end time.');
      return;
    }

    const payload = {
      employee: 'http://localhost:8000/api/v1/employees/1/', // Hardcoded employee, it should be authenticated user/employee
      title,
      start_datetime: new Date(start).toISOString(),
      end_datetime: new Date(end).toISOString(),
      participants: selectedEmployees.map((emp) => emp.url),
    };

    try {
      let response;
      if (appointment.id > 0) {
        response = await fetch(`${config.APPOINTMENT_ENDPOINT}/${appointment.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${config.APPOINTMENT_ENDPOINT}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save appointment.');
      }

      const data = await response.json();

      const savedAppointment = parseAppointment(data);

      alert('Appointment saved successfully.');

      if (onSave) {
        onSave(savedAppointment);
      }

      closePopup();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const addParticipant = async () => {
    if (!departmentId) return;
    setLoadingEmployees(true);
    try {
      const res = await fetch(`${config.DEPARTMENT_ENDPOINT}/${departmentId}/employees/`);
      const data: Employee[] = await res.json();
      setEmployees(data);
      setShowEmployeeList(true);
    } catch {
      setShowEmployeeList(false);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const addEmployee = (emp: Employee) => {
    if (!selectedEmployees.find((e) => e.id === emp.id)) {
      setSelectedEmployees((prev) => [...prev, emp]);
    }
  };

  const removeEmployee = (id: number) => {
    setSelectedEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  const hasOverlap = overLappedAppointments.length > 0;
  const overlapCount = overLappedAppointments.length;

  if (showPopup) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
        onClick={closePopup}
      >
        <form
          ref={popupRef}
          onSubmit={handleSubmit}
          data-testid="appointment-form"
          className="relative bg-white text-black shadow-lg p-6 rounded border w-180 max-w-full z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center mt-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold text-center border rounded px-8 py-2 w-full sm:w-4/5 md:w-3/4 lg:w-2/3"
              placeholder="Appointment Title"
              required
            />
          </div>

          <div className="flex gap-4 mb-4 mt-8">
            <div className="flex flex-col flex-1">
              <label className="mb-1 font-semibold text-gray-700" htmlFor="startDate">
                Start date
              </label>
              <input
                id="startDate"
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="border rounded px-3 py-2"
                required
              />
            </div>
            <div className="flex flex-col flex-1">
              <label className="mb-1 font-semibold text-gray-700" htmlFor="endDate">
                End date
              </label>
              <input
                id="endDate"
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="border rounded px-3 py-2"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Department
              <select
                value={departmentId ?? ''}
                onChange={(e) => setDepartmentId(Number(e.target.value))}
                className="mt-1 block w-full border rounded px-2 py-1 text-sm"
              >
                <option value="" disabled>
                  -- Select Department --
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Participants</label>
            <div className="mb-2 flex gap-2 flex-wrap">
              {selectedEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-blue-200 text-blue-800 rounded px-2 py-1 flex items-center gap-1"
                >
                  {emp.name}
                  <button
                    type="button"
                    onClick={() => removeEmployee(emp.id)}
                    className="text-red-600 font-bold"
                    aria-label="Remove participant"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addParticipant}
              disabled={loadingEmployees || !departmentId}
              className="px-3 py-1 border rounded bg-green-200 text-green-800 hover:bg-green-300 disabled:opacity-50"
            >
              {loadingEmployees ? 'Loading...' : 'Add Participant'}
            </button>

            {showEmployeeList && (
              <div
                ref={employeeListRef}
                className="max-h-40 overflow-y-auto mt-2 border rounded bg-white p-2 shadow-lg z-20"
              >
                {employees.length === 0 && <div>No employees found.</div>}
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="cursor-pointer hover:bg-gray-100 px-2 py-1"
                    onClick={() => addEmployee(emp)}
                  >
                    {emp.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-8">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>

            {appointment.id > 0 && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            )}

            <button
              type="button"
              onClick={closePopup}
              className="px-6 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div
      className="absolute left-0"
      style={{
        top,
        height,
        width: '100%',
        cursor: 'pointer',
      }}
      onClick={togglePopup}
    >
      <div
        className={`relative rounded px-2 py-1 overflow-hidden bg-blue-300 transition-all duration-200`}
        style={{
          height: hasOverlap ? height * 0.85 : height,
          fontSize: hasOverlap ? '0.75rem' : '1rem',
        }}
      >
        <div className="text-xs font-semibold text-white truncate">{appointment.title}</div>

        {hasOverlap && (
          <div className="absolute right-0 top-0 p-1 bg-gray-400 text-white rounded text-xs font-semibold select-none">
            +{overlapCount}
          </div>
        )}
      </div>
    </div>
  );
}
