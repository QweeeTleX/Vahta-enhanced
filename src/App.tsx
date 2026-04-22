import { useState } from 'react'
import './styles/App.css'
import { teams, type TeamId, type ShiftCode } from './data/vahta'
import {
  buildMonthSchedule,
  summarizeMonth,
  buildShiftBreakdown,
  buildMonthlyLoadData,
  buildWeekendDayShiftTrend,
  type TeamShiftOverrides,
} from './lib/schedule'
import MonthScheduleTable from './components/MonthSchedule'
import ShiftBreakdownChart from './components/ShiftBreakdownChart'
import MonthlyLoadChart from './components/MonthlyLoadChart'
import WeekendTrendChart from "./components/WeekendTrendChart"



function App() {
  const [selectedTeam, setSelectedTeam] = useState<TeamId>(2)

  const [visibleMonthOffset, setVisibleMonthOffset] = useState<0 | 1>(0)

  const [teamOverrides, setTeamOverrides] = useState<TeamShiftOverrides>({
    1: {},
    2: {},
    3: {},
    4: {},
  })

  const currentDate = new Date()

  const visibleDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + visibleMonthOffset,
    1,
  )

  const year = visibleDate.getFullYear()
  const month = visibleDate.getMonth()

  const selectedTeamOverrides = teamOverrides[selectedTeam]

  const selectedTeamLabel =
    teams.find((team) => team.id === selectedTeam)?.label ?? `Бригада ${selectedTeam}`

  const monthEntries = buildMonthSchedule(year, month, selectedTeam, selectedTeamOverrides)
  const summary = summarizeMonth(monthEntries)
  const shiftBreakdown = buildShiftBreakdown(monthEntries)
  const monthlyLoadData = buildMonthlyLoadData(
    visibleDate,
    selectedTeam,
    4,
    selectedTeamOverrides,
  )

  const weekendDayShiftTrend = buildWeekendDayShiftTrend(monthEntries)

  const startOfToday = new Date(year, month, currentDate.getDate())

  const nextMonthDate = new Date(year, month + 1, 1)
  const nextMonthEntries = buildMonthSchedule(
    nextMonthDate.getFullYear(),
    nextMonthDate.getMonth(),
    selectedTeam,
    selectedTeamOverrides,
  )

  const upcomingEntries = [...monthEntries, ...nextMonthEntries]
    .filter((entry) => entry.meta.hours > 0 && entry.date >= startOfToday)
    .slice(0, 6)

  const monthLabel = visibleDate.toLocaleString('ru-RU', {
    month: 'long',
    year: 'numeric',
  })

  const summaryItems = [
    {
      label: 'Рабочие дни',
      value: summary.workDays,
      note: 'Запланированные смены в текущем месяце',
    },
    {
      label: 'Всего часов',
      value: summary.totalHours,
      note: 'По модели ротации с 12-часовыми сменами',
    },
    {
      label: 'Дневные смены',
      value: summary.dayShiftCount,
      note: 'Сумма смен D1 и D2',
    },
    {
      label: 'Ночные смены',
      value: summary.nightShiftCount,
      note: 'Сумма смен N1 и N2',
    },
    {
      label: 'Отсыпные',
      value: summary.recoveryDays,
      note: 'Буфер после ночного цикла',
    },
    {
      label: 'Выходные',
      value: summary.offDays,
      note: 'Полностью свободные дни календаря',
    },
  ]

  function setOverrideForSelectedTeam(entryKey: string, code: ShiftCode) {
    setTeamOverrides((prev) => ({
      ...prev,
      [selectedTeam]: {
        ...prev[selectedTeam],
        [entryKey]: code,
      },
    }))
  }

  function clearOverrideForSelectedTeam(entryKey: string) {
    setTeamOverrides((prev) => {
      const nextSelectedTeamOverrides = { ...prev[selectedTeam] }

      delete nextSelectedTeamOverrides[entryKey]

      return {
        ...prev,
        [selectedTeam]: nextSelectedTeamOverrides,
      }
    })
  }

  function showCurrentMonth() {
    setVisibleMonthOffset(0)
  }

  function showNextMonth() {
    setVisibleMonthOffset(1)
  }

  return (
    <main className="page">
      <section className="panel hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">VAHTA Analytics</p>
          <h1 className="page-title">Дашборд сменной нагрузки для бригадного графика</h1>
          <p className="hero-text">
            Построено на исходной логике ротации VAHTA: график превращается в удобный дашборд
            для оценки месячной нагрузки, состава смен и ближайшего планирования.
          </p>
        </div>

        <aside className="hero-meta">
          <div className="meta-block">
            <span className="meta-label">Текущий месяц</span>
            <strong className="meta-value">{monthLabel}</strong>
          </div>

          <div className="meta-grid">
            <div className="meta-item">
              <span className="meta-label">Выбранная бригада</span>
              <strong className="meta-strong">{selectedTeamLabel}</strong>
            </div>

            <div className="meta-item">
              <span className="meta-label">Часов за месяц</span>
              <strong className="meta-strong">{summary.totalHours}</strong>
            </div>

            <div className="meta-item">
              <span className="meta-label">Рабочие дни</span>
              <strong className="meta-strong">{summary.workDays}</strong>
            </div>

            <div className="meta-item">
              <span className="meta-label">Баланс ротации</span>
              <strong className="meta-strong">
                {summary.dayShiftCount}/{summary.nightShiftCount}
              </strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="panel controls-panel">
        <div className="panel-heading">
          <div className="panel-heading-copy">
            <p className="eyebrow">Управление</p>
            <h2 className="panel-title">Выбери бригаду</h2>
            <p className="panel-text">
              Все карточки и графики ниже пересчитываются из одной модели расписания, поэтому
              можно сравнивать нагрузку без просмотра всего календаря.
            </p>
          </div>
        </div>

        <div className="team-tabs">
          {teams.map((team) => (
            <button
              key={team.id}
              type="button"
              className={team.id === selectedTeam ? 'team-button active' : 'team-button'}
              onClick={() => setSelectedTeam(team.id)}
            >
              {team.label}
            </button>
          ))}
        </div>
      </section>

      <MonthScheduleTable
        entries={monthEntries}
        teamLabel={selectedTeamLabel}
        monthLabel={monthLabel}
        canGoPrev={visibleMonthOffset === 1}
        canGoNext={visibleMonthOffset === 0}
        onPrevMonth={showCurrentMonth}
        onNextMonth={showNextMonth}
        onSetOverride={setOverrideForSelectedTeam}
        onClearOverride={clearOverrideForSelectedTeam}
      />

      <section className="summary-strip">
        {summaryItems.map((item) => (
          <article key={item.label} className="summary-card">
            <span className="summary-card-label">{item.label}</span>
            <strong className="summary-card-value">{item.value}</strong>
            <span className="summary-card-note">{item.note}</span>
          </article>
        ))}
      </section>

      <section className="workspace">
        <section className="panel shifts-panel">
          <div className="panel-heading">
            <div className="panel-heading-copy">
              <p className="eyebrow">Ближайший период</p>
              <h2 className="panel-title">Ближайшие смены</h2>
              <p className="panel-text">
                Быстрый просмотр ближайших запланированных смен из текущей ротации.
              </p>
            </div>

            <span className="panel-badge">{selectedTeamLabel}</span>
          </div>

          <ul className="shift-feed">
            {upcomingEntries.map((entry) => {
              const dateLabel = entry.date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: 'short',
              })

              return (
                <li key={entry.key} className="shift-card">
                  <span className="shift-date-chip">{dateLabel}</span>

                  <div className="shift-copy">
                    <strong>{entry.meta.label}</strong>
                    <span className="shift-meta">
                      Запланированный слот ротации для {selectedTeamLabel}
                    </span>
                  </div>

                  <span className="shift-pill" style={{ backgroundColor: entry.meta.color }}>
                    {entry.meta.shortLabel}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <div className="chart-stack">
          
          <ShiftBreakdownChart items={shiftBreakdown} />

          <MonthlyLoadChart items={monthlyLoadData} />

          <WeekendTrendChart points={weekendDayShiftTrend} />

        </div>
      </section>
    </main>
  )
}

export default App
