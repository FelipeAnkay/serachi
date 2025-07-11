import React, { useMemo } from 'react';
import { format, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CustomAgendaCalendar({
  events = [],
  selectedDate,
  setSelectedDate,
  onMonthChange,
  onSelectEvent,
}) {
  const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

  const groupedEvents = useMemo(() => {
    const eventsInMonth = events.filter((e) => {
      const date = typeof e.start === 'string' ? parseISO(e.start) : e.start;
      return date >= startOfMonth && date <= endOfMonth;
    });

    const groups = {};
    eventsInMonth.forEach((event) => {
      const start = typeof event.start === 'string' ? parseISO(event.start) : event.start;
      const end = typeof event.end === 'string' ? parseISO(event.end) : event.end;
      const dateKey = format(start, 'yyyy-MM-dd');
      const hourKey = format(start, 'HH:mm');
      const staffKey = event.resource?.staffEmail || 'NO STAFF';

      if (!groups[dateKey]) groups[dateKey] = {};
      if (!groups[dateKey][hourKey]) groups[dateKey][hourKey] = {};
      if (!groups[dateKey][hourKey][staffKey]) groups[dateKey][hourKey][staffKey] = [];

      groups[dateKey][hourKey][staffKey].push({ ...event, start, end });
    });

    return groups;
  }, [events, selectedDate]);

  const handlePrev = () => {
    const prev = new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1);
    const endOfPrev = new Date(prev.getFullYear(), prev.getMonth() + 1, 0, 23, 59, 59, 999);
    setSelectedDate(prev);
    onMonthChange && onMonthChange(prev, endOfPrev);
  };

  const handleNext = () => {
    const next = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);
    const endOfNext = new Date(next.getFullYear(), next.getMonth() + 1, 0, 23, 59, 59, 999);
    setSelectedDate(next);
    onMonthChange && onMonthChange(next, endOfNext);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-300 dark:border-zinc-700 p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrev} className="text-slate-700 dark:text-slate-100 hover:text-blue-600">
          <ChevronLeft />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          {format(startOfMonth, 'MMMM yyyy')}
        </h2>
        <button onClick={handleNext} className="text-slate-700 dark:text-slate-100 hover:text-blue-600">
          <ChevronRight />
        </button>
      </div>

      {Object.keys(groupedEvents).length === 0 ? (
        <p className="text-slate-500 text-center">No events this month.</p>
      ) : (
        <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
          {Object.entries(groupedEvents).sort().map(([date, hours]) => (
            <div key={date}>
              <h3 className="text-md font-semibold text-slate-600 dark:text-slate-300 border-b mb-2">
                {format(new Date(date), 'EEEE dd MMMM yyyy')}
              </h3>
              {Object.entries(hours).sort().map(([hour, staffs]) => (
                <div key={hour} className="pl-4 mb-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{hour}</p>
                  {Object.entries(staffs).sort().map(([staff, evts]) => (
                    <div key={staff} className="pl-4 mb-2">
                      <p className="text-xs text-slate-400">Staff: {staff}</p>
                      <div className="space-y-1">
                        {evts.map((e, i) => (
                          <div
                            key={i}
                            className="text-sm text-white px-3 py-1 rounded shadow cursor-pointer"
                            style={{ backgroundColor: e.staffColor || '#6b7280' }}
                            onClick={() => onSelectEvent && onSelectEvent(e)}
                          >
                            {e.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
