import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DayView from './DayView';
import type { Appointment } from './types';
import config from './constants';
import { parseAppointments } from './utils';

export default function SidebarCalendar() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchClosestDateWithAppointments = async () => {
      try {
        const response = await fetch(`${config.APPOINTMENT_ENDPOINT}/closest/`);
        if (!response.ok) throw new Error('Failed to fetch closest appointment date');
        const data = await response.json();
        const date = new Date(data.start_datetime);
        setSelectedDate(date);
      } catch (err) {
        console.error('Error fetching closest appointment date:', err);
      }
    };

    fetchClosestDateWithAppointments();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchAppointments = async () => {
      const dateStr = selectedDate.toISOString().slice(0, 10);
      try {
        const response = await fetch(`${config.APPOINTMENT_ENDPOINT}/?date=${dateStr}`);
        if (!response.ok) throw new Error('Failed to fetch appointments');
        const data = await response.json();
        const parsedAppointments = parseAppointments(data);
        setAppointments(parsedAppointments);
      } catch (err) {
        console.error('Error loading appointments:', err);
        setAppointments([]);
      }
    };

    fetchAppointments();
  }, [selectedDate]);

  const changeDay = (amount: number) => {
    if (!selectedDate) return;
    setSelectedDate((prev) => {
      const newDate = new Date(prev!);
      newDate.setDate(newDate.getDate() + amount);
      return newDate;
    });
  };

  return (
    <div className="flex flex-col h-dvh max-h-dvh">
      <div className="flex-shrink-0 w-full max-w-[500px] sm:w-[500px] h-full border rounded-xl shadow p-4 bg-white relative flex flex-col">
        <div className="flex items-center justify-center mb-4 space-x-2">
          <button
            onClick={() => changeDay(-1)}
            className="px-3 py-1 border rounded shadow-sm hover:bg-blue-100"
            aria-label="Previous day"
          >
            ←
          </button>

          <DatePicker
            selected={selectedDate}
            onChange={(date) => date && setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border rounded px-3 py-1 text-sm w-40 text-center"
          />

          <button
            onClick={() => changeDay(1)}
            className="px-3 py-1 border rounded shadow-sm hover:bg-blue-100"
            aria-label="Next day"
          >
            →
          </button>
        </div>

        <DayView date={selectedDate} appointments={appointments} />
      </div>
    </div>
  );
}
