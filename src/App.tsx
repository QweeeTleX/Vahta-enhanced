import { max, scaleBand, scaleLinear } from 'd3'
import { useState } from 'react'
import './App.css'
import { teams, type TeamId } from './data/vahta'
import {
  buildMonthSchedule,
  summarizeMonth,
  buildShiftBreakdown,
  buildMonthlyLoadData,
} from './lib/schedule'

const chartWidth = 520
const chartHeight = 320

const chartMargin = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 48,
}

function App() {
  const [selectedTeam, setSelectedTeam] = useState<TeamId>(2)

  const currentDate = new Date()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const selectedTeamLabel =
    teams.find((team) => team.id === selectedTeam)?.label ?? `Team ${selectedTeam}`

  const monthEntries = buildMonthSchedule(year, month, selectedTeam)
  const summary = summarizeMonth(monthEntries)
  const shiftBreakdown = buildShiftBreakdown(monthEntries)
  const monthlyLoadData = buildMonthlyLoadData(currentDate, selectedTeam, 4)

  const innerWidth = chartWidth - chartMargin.left - chartMargin.right
  const innerHeight = chartHeight - chartMargin.top - chartMargin.bottom
  const maxValue = max(shiftBreakdown, (item) => item.value) ?? 0

  const monthlyMaxHours = max(monthlyLoadData, (item) => item.totalHours) ?? 0

  const monthlyXScale = scaleBand()
    .domain(monthlyLoadData.map((item) => item.label))
    .range([0, innerWidth])
    .padding(0.2)

  const monthlyYScale = scaleLinear()
    .domain([0, monthlyMaxHours])
    .nice()
    .range([innerHeight, 0])

  const monthlyYTicks = monthlyYScale.ticks(5)

  const xScale = scaleBand()
    .domain(shiftBreakdown.map((item) => item.label))
    .range([0, innerWidth])
    .padding(0.2)

  const yScale = scaleLinear().domain([0, maxValue]).nice().range([innerHeight, 0])
  const yTicks = yScale.ticks(5)

  const startOfToday = new Date(year, month, currentDate.getDate())

  const upcomingEntries = monthEntries
  .filter((entry) => entry.meta.hours > 0 && entry.date >= startOfToday)
  .slice(0, 6)


  const monthLabel = currentDate.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  const summaryItems = [
    {
      label: 'Work days',
      value: summary.workDays,
      note: 'Scheduled shifts in the current month',
    },
    {
      label: 'Total hours',
      value: summary.totalHours,
      note: 'Based on the 12-hour rotation model',
    },
    {
      label: 'Day shifts',
      value: summary.dayShiftCount,
      note: 'D1 and D2 slots combined',
    },
    {
      label: 'Night shifts',
      value: summary.nightShiftCount,
      note: 'N1 and N2 slots combined',
    },
    {
      label: 'Recovery days',
      value: summary.recoveryDays,
      note: 'Recovery buffer after night rotation',
    },
    {
      label: 'Off days',
      value: summary.offDays,
      note: 'Fully free calendar days',
    },
  ]

  return (
    <main className="page">
      <section className="panel hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">VAHTA Analytics</p>
          <h1 className="page-title">Shift load dashboard for brigade rotations</h1>
          <p className="hero-text">
            Built on the original VAHTA rotation logic, this version turns the schedule into a
            scan-friendly dashboard for monthly load, shift composition and near-term planning.
          </p>
        </div>

        <aside className="hero-meta">
          <div className="meta-block">
            <span className="meta-label">Active month</span>
            <strong className="meta-value">{monthLabel}</strong>
          </div>

          <div className="meta-grid">
            <div className="meta-item">
              <span className="meta-label">Selected team</span>
              <strong className="meta-strong">{selectedTeamLabel}</strong>
            </div>

            <div className="meta-item">
              <span className="meta-label">Monthly hours</span>
              <strong className="meta-strong">{summary.totalHours}</strong>
            </div>

            <div className="meta-item">
              <span className="meta-label">Work days</span>
              <strong className="meta-strong">{summary.workDays}</strong>
            </div>

            <div className="meta-item">
              <span className="meta-label">Rotation mix</span>
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
            <p className="eyebrow">Controls</p>
            <h2 className="panel-title">Choose a brigade</h2>
            <p className="panel-text">
              All cards and charts below recalculate from the same schedule model, so you can
              compare load patterns without scanning the entire calendar.
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
              <p className="eyebrow">Near term</p>
              <h2 className="panel-title">Upcoming shifts</h2>
              <p className="panel-text">
                Quick read on the next scheduled slots from the active monthly rotation.
              </p>
            </div>

            <span className="panel-badge">{selectedTeamLabel}</span>
          </div>

          <ul className="shift-feed">
            {upcomingEntries.map((entry) => {
              const dateLabel = entry.date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
              })

              return (
                <li key={entry.key} className="shift-card">
                  <span className="shift-date-chip">{dateLabel}</span>

                  <div className="shift-copy">
                    <strong>{entry.meta.label}</strong>
                    <span className="shift-meta">Scheduled rotation slot for {selectedTeamLabel}</span>
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
          <section className="panel chart-panel">
            <div className="panel-heading">
              <div className="panel-heading-copy">
                <p className="eyebrow">Current month</p>
                <h2 className="panel-title">Shift breakdown</h2>
                <p className="panel-text">
                  Distribution of day, night, recovery and off days for the active month.
                </p>
              </div>
            </div>

            <div className="chart-surface">
              <svg
                className="chart"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                role="img"
                aria-label="Shift breakdown chart"
              >
                <g transform={`translate(${chartMargin.left}, ${chartMargin.top})`}>
                  {yTicks.map((tick) => {
                    const y = yScale(tick)

                    return (
                      <line
                        key={tick}
                        className="chart-grid-line"
                        x1={0}
                        y1={y}
                        x2={innerWidth}
                        y2={y}
                      />
                    )
                  })}

                  {yTicks.map((tick) => {
                    const y = yScale(tick)

                    return (
                      <text
                        key={`${tick}-label`}
                        className="chart-tick-label"
                        x={-12}
                        y={y}
                        dy="0.32em"
                        textAnchor="end"
                      >
                        {tick}
                      </text>
                    )
                  })}

                  {shiftBreakdown.map((item) => {
                    const x = xScale(item.label) ?? 0
                    const y = yScale(item.value)
                    const barHeight = innerHeight - y

                    return (
                      <rect
                        className="chart-bar"
                        key={item.label}
                        x={x}
                        y={y}
                        width={xScale.bandwidth()}
                        height={barHeight}
                        rx={12}
                        fill={item.color}
                      />
                    )
                  })}

                  {shiftBreakdown.map((item) => {
                    const x = xScale(item.label) ?? 0

                    return (
                      <text
                        className="chart-label"
                        key={`${item.label}-label`}
                        x={x + xScale.bandwidth() / 2}
                        y={innerHeight + 24}
                        textAnchor="middle"
                      >
                        {item.label}
                      </text>
                    )
                  })}

                  {shiftBreakdown.map((item) => {
                    const x = xScale(item.label) ?? 0
                    const y = yScale(item.value)

                    return (
                      <text
                        key={`${item.label}-value`}
                        className="chart-value"
                        x={x + xScale.bandwidth() / 2}
                        y={y - 8}
                        textAnchor="middle"
                      >
                        {item.value}
                      </text>
                    )
                  })}

                  <line
                    className="chart-axis"
                    x1={0}
                    y1={innerHeight}
                    x2={innerWidth}
                    y2={innerHeight}
                  />
                </g>
              </svg>
            </div>
          </section>

          <section className="panel chart-panel">
            <div className="panel-heading">
              <div className="panel-heading-copy">
                <p className="eyebrow">Trend</p>
                <h2 className="panel-title">Monthly load chart</h2>
                <p className="panel-text">
                  Total scheduled hours across the last four months for the selected brigade.
                </p>
              </div>
            </div>

            <div className="chart-surface">
              <svg
                className="chart"
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                role="img"
                aria-label="Monthly load chart"
              >
                <g transform={`translate(${chartMargin.left}, ${chartMargin.top})`}>
                  {monthlyYTicks.map((tick) => {
                    const y = monthlyYScale(tick)

                    return (
                      <line
                        key={tick}
                        className="chart-grid-line"
                        x1={0}
                        y1={y}
                        x2={innerWidth}
                        y2={y}
                      />
                    )
                  })}

                  {monthlyLoadData.map((item) => {
                    const x = monthlyXScale(item.label) ?? 0
                    const y = monthlyYScale(item.totalHours)
                    const barHeight = innerHeight - y

                    return (
                      <rect
                        key={item.label}
                        className="chart-bar"
                        x={x}
                        y={y}
                        width={monthlyXScale.bandwidth()}
                        height={barHeight}
                        rx={12}
                        fill="var(--accent-strong)"
                      />
                    )
                  })}

                  {monthlyLoadData.map((item) => {
                    const x = monthlyXScale(item.label) ?? 0

                    return (
                      <text
                        key={`${item.label}-month-label`}
                        className="chart-label"
                        x={x + monthlyXScale.bandwidth() / 2}
                        y={innerHeight + 24}
                        textAnchor="middle"
                      >
                        {item.label}
                      </text>
                    )
                  })}

                  {monthlyLoadData.map((item) => {
                    const x = monthlyXScale(item.label) ?? 0
                    const y = monthlyYScale(item.totalHours)

                    return (
                      <text
                        key={`${item.label}-hours`}
                        className="chart-value"
                        x={x + monthlyXScale.bandwidth() / 2}
                        y={y - 8}
                        textAnchor="middle"
                      >
                        {item.totalHours}
                      </text>
                    )
                  })}

                  {monthlyYTicks.map((tick) => {
                    const y = monthlyYScale(tick)

                    return (
                      <text
                        key={`${tick}-monthly-label`}
                        className="chart-tick-label"
                        x={-12}
                        y={y}
                        dy="0.32em"
                        textAnchor="end"
                      >
                        {tick}
                      </text>
                    )
                  })}

                  <line
                    className="chart-axis"
                    x1={0}
                    y1={innerHeight}
                    x2={innerWidth}
                    y2={innerHeight}
                  />
                </g>
              </svg>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}

export default App
