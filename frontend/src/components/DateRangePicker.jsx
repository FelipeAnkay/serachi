import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-date-range"
import { formatDateShort, formatDateISO } from './formatDateDisplay'
import "react-date-range/dist/styles.css"
import "react-date-range/dist/theme/default.css"
import { AnimatePresence, motion } from "framer-motion"

const DateRangePicker = ({ value, onChange }) => {
  const [range, setRange] = useState([
    {
      startDate: value.start || new Date(),
      endDate: value.end || new Date(),
      key: "selection"
    }
  ])
  const [open, setOpen] = useState(false)

  const handleSelect = (ranges) => {
    const { startDate, endDate } = ranges.selection
    setRange([ranges.selection])
    onChange({ start: formatDateISO(startDate), end: formatDateISO(endDate) })
    setOpen(false)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 px-4 py-2 bg-zinc-800 text-white rounded-xl shadow-md hover:bg-zinc-700 transition"
      >
        <CalendarIcon className="w-5 h-5" />
        <span>
          {value.start && value.end
            ? `${formatDateShort(value.start)} - ${formatDateShort(value.end)}`
            : "Select Range"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 shadow-xl rounded-2xl overflow-hidden"
          >
            <DateRange
              editableDateInputs
              onChange={handleSelect}
              moveRangeOnFirstSelection={false}
              ranges={range}
              rangeColors={["#10B981"]}
              months={1}
              direction="horizontal"
              className="bg-white text-black dark:bg-zinc-800 dark:text-white"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DateRangePicker