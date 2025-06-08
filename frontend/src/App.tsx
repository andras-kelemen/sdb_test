import { useState } from 'react';
import SidebarCalendar from './SideBarCalendar';
import { CalendarDays } from 'lucide-react';

export default function App() {
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-bold">SBD Test</div>
        <ul className="flex space-x-4">
          <li>
            <button
              onClick={() => setCalendarOpen(!calendarOpen)}
              className="hover:bg-gray-700 px-3 py-2 rounded transition flex items-center"
              aria-label="Toggle calendar"
            >
              <CalendarDays className="w-5 h-5" />
            </button>
          </li>
          {/* Add more menu items here if needed */}
        </ul>
      </nav>

      {/* Main content and sidebar */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Main content area */}
        <main className="flex-1 p-4">
          <h1 className="text-2xl font-semibold mb-4">Lorem Ipsum</h1>
        </main>

        {/* Calendar sidebar */}
        {calendarOpen && <SidebarCalendar />}
      </div>
    </div>
  );
}
