import '../styles/MonthScheduleTable.css'
import type { ScheduleEntry } from '../lib/schedule'

type MonthScheduleTableProps = {
  entries: ScheduleEntry[]
  teamLabel: string
  monthLabel: string
}

function MonthScheduleTable({
  entries,
  teamLabel,
  monthLabel,
}: MonthScheduleTableProps) {
	const weekDayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

	const firstDayOfMonth = entries[0]?.date
	const leadingEmptyDays = firstDayOfMonth
		? (firstDayOfMonth.getDay() + 6) % 7
		: 0

	const emptyCells = Array.from({ length: leadingEmptyDays })
	const todayKey = new Date().toDateString()

  return (
    <section className="panel month-table-panel">
      <div className="panel-heading">
        <div className="panel-heading-copy">
          <p className="eyebrow">Календарь</p>
          <h2 className="panel-title">Таблица смен на месяц</h2>
          <p className="panel-text">
            Полное расписание для {teamLabel} на {monthLabel}.
          </p>
        </div>
      </div>

      <div className="month-table-wrap">
        <div className="calendar-grid-wrap">
  <div className="calendar-grid">
    {weekDayLabels.map((day) => (
      <div key={day} className="calendar-weekday">
        {day}
      </div>
    ))}

    {emptyCells.map((_, index) => (
      <div
        key={`empty-${index}`}
        className="calendar-day calendar-day-empty"
        aria-hidden="true"
      />
    ))}

    {entries.map((entry) => {
      const isToday = entry.date.toDateString() === todayKey

      return (
        <article
          key={entry.key}
          className={`calendar-day calendar-day-${entry.meta.category} ${
            isToday ? 'calendar-day-today' : ''
          }`}
        >
          <span className="calendar-date-number">{entry.date.getDate()}</span>

						<div className="calendar-day-content">
  <strong className="calendar-shift-title">{entry.meta.label}</strong>

  <span className="calendar-shift-short">{entry.meta.shortLabel}</span>

  {entry.meta.hours > 0 && (
    <span className="calendar-shift-hours">
      {entry.meta.category === 'night' ? '19:00-07:00' : '07:00-19:00'}
    </span>
  )}
</div>
	
        </article>
      )
    })}
  </div>
</div>

      </div>
    </section>
  )
}

export default MonthScheduleTable
