import { formatDateShort } from "./formatDateDisplay";
import { format,startOfWeek, endOfWeek } from 'date-fns';

const CustomCalendarToolbar = ({ startDate, endDate, onNavigate, onView, view, label, date} ) => {
  const goToBack = () => onNavigate('PREV');
  const goToNext = () => onNavigate('NEXT');
  const goToToday = () => onNavigate('TODAY');

  const goToView = (viewType) => () => onView(viewType);

  //console.log("Dates: ", {startDate,endDate})

  const displayLabel = (() => {
    if (view === "day") {
      return formatDateShort(date); // la fecha única del día
    }

    if (view === "week") {
      const start = startOfWeek(date, { weekStartsOn: 1 }); // lunes
      const end = endOfWeek(date, { weekStartsOn: 1 });     // domingo
      return `${formatDateShort(start)} – ${formatDateShort(end)}`;
    }

    if (view === "month" && startDate && endDate) {
      return `${formatDateShort(startDate)} – ${formatDateShort(endDate)}`;
    }

    if (view === "agenda" && startDate && endDate) {
      const monthName = format(startDate, 'MMMM');
      return `${monthName} Schedule`;
    }

    return label || "Schedule";
  })();

  return (
    <div className="flex flex-wrap justify-between items-center p-2 bg-[#18394C] text-slate-800 border-b border-blue-900 rounded-t-md">
      <div className="flex gap-2 items-center">
        <button onClick={goToToday} className="bg-[#3BA0AC] hover:bg-[#6BBCC5] text-cyan-50 px-2 py-1 rounded ">Today</button>
        <button onClick={goToBack} className="bg-[#3BA0AC] hover:bg-[#6BBCC5] text-cyan-50 px-2 py-1 rounded ">Back</button>
        <button onClick={goToNext} className="bg-[#3BA0AC] hover:bg-[#6BBCC5] text-cyan-50 px-2 py-1 rounded ">Next</button>
      </div>
      <div className="text-lg font-semibold text-center text-cyan-50">{displayLabel}</div>
      <div className="flex gap-1">
        {['month', 'week', 'day', 'agenda'].map((v) => (
          <button
            key={v}
            onClick={goToView(v)}
            className={`px-2 py-1 rounded ${view === v ? 'bg-[#118290] hover:bg-[#0d6c77] text-cyan-50' : 'bg-[#3BA0AC] hover:bg-[#6BBCC5] text-cyan-50'}`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CustomCalendarToolbar;