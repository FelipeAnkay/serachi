import { formatDateShort } from "./formatDateDisplay";

const CustomCalendarToolbar = ({onNavigate, onView, view }) => {
  const goToBack = () => onNavigate('PREV');
  const goToNext = () => onNavigate('NEXT');
  const goToToday = () => onNavigate('TODAY');

  const goToView = (viewType) => () => onView(viewType);

  return (
    <div className="flex flex-wrap justify-between items-center p-2 bg-blue-950 text-white border-b border-blue-900 rounded-t-md">
      <div className="flex gap-2 items-center">
        <button onClick={goToToday} className="bg-white text-blue-950 px-2 py-1 rounded hover:bg-gray-100">Today</button>
        <button onClick={goToBack} className="bg-white text-blue-950 px-2 py-1 rounded hover:bg-gray-100">Back</button>
        <button onClick={goToNext} className="bg-white text-blue-950 px-2 py-1 rounded hover:bg-gray-100">Next</button>
      </div>
      <div className="text-lg font-semibold text-center">Schedule</div>
      <div className="flex gap-1">
        {['month', 'week', 'day', 'agenda'].map((v) => (
          <button
            key={v}
            onClick={goToView(v)}
            className={`px-2 py-1 rounded ${view === v ? 'bg-white text-blue-950' : 'bg-blue-800 hover:bg-blue-700'}`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CustomCalendarToolbar;