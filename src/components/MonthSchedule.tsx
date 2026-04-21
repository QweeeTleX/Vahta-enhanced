import '../styles/MonthScheduleTable.css'
import { overrideShiftCodes, shiftMeta, type ShiftCode } from '../data/vahta'
import type { ScheduleEntry } from '../lib/schedule'

type MonthScheduleTableProps = {
  entries: ScheduleEntry[]
  teamLabel: string
  monthLabel: string
  onSetOverride: (entryKey: string, code: ShiftCode) => void
  onClearOverride: (entryKey: string) => void
}

function MonthScheduleTable({
  entries,
  teamLabel,
  monthLabel,
  onSetOverride,
  onClearOverride,
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

              const activeCode = entry.code
              const baseCode = entry.baseCode
              const isOverrideDay = entry.isOverride

              const overrideOptions = overrideShiftCodes.map((code) => ({
                code,
                meta: shiftMeta[code],
                isActive: code === activeCode,
              }))

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

                  <div className="calendar-override-actions">
                    {overrideOptions.map((option) => (
                      <button
                        key={`${entry.key}-${option.code}`}
                        type="button"
                        className={
                          option.isActive
                            ? 'calendar-override-button active'
                            : 'calendar-override-button'
                        }
                        data-mobile-label={
                          option.code === 'RECOVERY'
                            ? 'О'
                            : option.code === 'OFF'
                              ? 'В'
                              : option.meta.shortLabel
                        }
                        onClick={() => onSetOverride(entry.key, option.code)}
                      >
                        <span className="calendar-override-button-text">
                          {option.meta.shortLabel}
                        </span>
                      </button>
                    ))}

                    {isOverrideDay && (
                      <button
                        type="button"
                        className="calendar-override-clear"
                        onClick={() => onClearOverride(entry.key)}
                      >
                        Сброс
                      </button>  
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
