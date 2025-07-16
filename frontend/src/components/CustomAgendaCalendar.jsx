import React, { useMemo, useState, useRef, useEffect } from 'react';
import { format, parseISO, addWeeks, subWeeks, startOfWeek, endOfWeek, isSameDay, isWithinInterval } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toZonedTime } from 'date-fns-tz';

export default function CustomAgendaCalendar({
  events = [],
  selectedDate,
  setSelectedDate,
  onMonthChange,
  onSelectEvent,
}) {
  const timeZone = 'America/Panama';
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
  const todayRef = useRef(null);
  const todayKey = format(toZonedTime(new Date(), timeZone), 'yyyy-MM-dd');


  useEffect(() => {
    const isSameMonth = selectedDate.getMonth() === new Date().getMonth()
      && selectedDate.getFullYear() === new Date().getFullYear();
    const aux = todayRef.current
    //console.log("Viewmode, isSameMonth, todaysRef: ", { viewMode, isSameMonth, aux })
    if (viewMode === 'month' && isSameMonth && todayRef.current) {
      todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [viewMode, selectedDate]);

  const startDate = viewMode === 'month'
    ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
    : startOfWeek(selectedDate, { weekStartsOn: 1 });

  const endDate = viewMode === 'month'
    ? new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 23, 59, 59, 999)
    : endOfWeek(selectedDate, { weekStartsOn: 1 });

  const groupedEvents = useMemo(() => {
    const filtered = events.filter((e) => {
      const start = typeof e.start === 'string' ? parseISO(e.start) : e.start;
      return isWithinInterval(start, { start: startDate, end: endDate });
    });

    const groups = {};
    filtered.forEach((event) => {
      const originalStartUTC = typeof event.start === 'string' ? parseISO(event.start) : event.start;
      const originalEndUTC = typeof event.end === 'string' ? parseISO(event.end) : event.end;
      //console.log("originalStartUTC", originalStartUTC)
      // Convertir fechas UTC a zona horaria local
      const originalStart = toZonedTime(originalStartUTC, timeZone);
      const originalEnd = toZonedTime(originalEndUTC, timeZone);
      //console.log("originalStart", originalStart)
      const dateOnly = new Date(
        originalStart.getFullYear(),
        originalStart.getMonth(),
        originalStart.getDate()
      );

      //console.log("dateOnly", dateOnly)

      const dateKey = format(dateOnly, 'yyyy-MM-dd');
      const hourKey = format(originalStart, 'HH:mm');
      const staffKey = event.staffName || event.staffEmail || 'NO STAFF';

      if (!groups[dateKey]) groups[dateKey] = {};
      if (!groups[dateKey][hourKey]) groups[dateKey][hourKey] = {};
      if (!groups[dateKey][hourKey][staffKey]) groups[dateKey][hourKey][staffKey] = [];

      groups[dateKey][hourKey][staffKey].push({ ...event, start: originalStart, end: originalEnd });
    });

    return groups;
  }, [events, selectedDate, viewMode]);

  const handlePrev = () => {
    const newDate = viewMode === 'month'
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
      : subWeeks(selectedDate, 1);
    setSelectedDate(newDate);
    if (viewMode === 'month') {
      const endOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0, 23, 59, 59, 999);
      onMonthChange && onMonthChange(newDate, endOfNewMonth);
    }
  };

  const handleNext = () => {
    const newDate = viewMode === 'month'
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
      : addWeeks(selectedDate, 1);
    setSelectedDate(newDate);
    if (viewMode === 'month') {
      const endOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0, 23, 59, 59, 999);
      onMonthChange && onMonthChange(newDate, endOfNewMonth);
    }
  };

  const weekDays = [...Array(7)].map((_, i) => {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    return day;
  });

  useEffect(() => {
    //console.log("Selected date: ", selectedDate)
    const now = new Date();
    const isSameMonth = selectedDate.getMonth() === now.getMonth() &&
      selectedDate.getFullYear() === now.getFullYear();
    const aux = todayRef.current
    //console.log("Viewmode, isSameMonth, todaysRef: ", { viewMode, isSameMonth, aux })

    if (viewMode === 'month') {
      setTimeout(() => {
        if (todayRef.current) {
          //console.log("Ejecutando movimiento")
          todayRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 1200);
    }
  }, []);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-300 dark:border-zinc-700 p-4 w-full">
      <div className="flex justify-between items-center mb-4">
        <button onClick={handlePrev} className="text-slate-700 dark:text-slate-100 hover:text-blue-600">
          <ChevronLeft />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">
          {viewMode === 'month' ? format(startDate, 'MMMM yyyy') : `${format(startDate, 'dd MMM')} - ${format(endDate, 'dd MMM yyyy')}`}
        </h2>
        <button onClick={handleNext} className="text-slate-700 dark:text-slate-100 hover:text-blue-600">
          <ChevronRight />
        </button>
      </div>

      <div className="flex justify-center mb-3">
        <button
          onClick={() => setViewMode(viewMode === 'month' ? 'week' : 'month')}
          className="px-3 py-1 rounded text-sm border bg-[#118290] hover:bg-[#0d6c77] text-cyan-50"
        >
          Switch to {viewMode === 'month' ? 'Weekly' : 'Monthly'} View
        </button>
      </div>

      {Object.keys(groupedEvents).length === 0 ? (
        <p className="text-slate-500 text-center">No events.</p>
      ) : (
        viewMode === 'week' ? (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const eventsByHour = groupedEvents[dateKey] || {};
              return (
                <div key={dateKey} className="border rounded p-2">
                  <h3 className="text-sm font-semibold text-[#00C49F] mb-2">
                    {format(day, 'EEEE d')}
                  </h3>
                  {Object.entries(eventsByHour).sort().map(([hour, staffs]) => (
                    <div key={hour} className="mb-2">
                      <p className="text-xs font-medium text-slate-900 dark:text-slate-400">{hour}</p>
                      {Object.entries(staffs).sort().map(([staff, evts]) => (
                        <div key={staff} className="pl-2">
                          <p className="text-[13px] text-slate-800">{staff}</p>
                          {evts.map((e, i) => (
                            <div
                              key={i}
                              className="text-xs text-white px-2 py-1 rounded shadow mb-1 cursor-pointer"
                              style={{ backgroundColor: e.staffColor || '#6b7280' }}
                              onClick={() => onSelectEvent && onSelectEvent(e)}
                            >
                              {e.title}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
            {Object.entries(groupedEvents).sort().map(([date, hours]) => (
              <div key={date} ref={date === todayKey ? todayRef : null}>
                <h3 className="text-md font-semibold text-[#00C49F] border-b mb-2">
                  {format(toZonedTime(new Date(date + 'T00:00:00'), 'America/Panama'), 'EEEE dd MMMM yyyy')}
                </h3>
                {Object.entries(hours).sort().map(([hour, staffs]) => (
                  <div key={hour} className="pl-4 mb-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-400">{hour}</p>
                    {Object.entries(staffs).sort().map(([staff, evts]) => (
                      <div key={staff} className="pl-4 mb-2">
                        <p className="text-s text-slate-700 font-medium">{staff}</p>
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
        )
      )}
    </div>
  );
}