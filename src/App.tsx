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

  const yScale = scaleLinear()
    .domain([0, maxValue])
    .nice()
    .range([innerHeight, 0])  

  const yTicks = yScale.ticks(5)  

  const upcomingEntries = monthEntries.filter((entry) => entry.meta.hours > 0).slice(0, 6)

  const monthLabel = currentDate.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <main className="page">
      <h1 className="page-title">VAHTA Analytics</h1>
      <p className="month-label">{monthLabel}</p>

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

      <section className="panel">
        <h2>MonthSummary</h2>
        <ul className="data-list">
          <li>Work days: {summary.workDays}</li>
          <li>Total hours: {summary.totalHours}</li>
          <li>Day shifts: {summary.dayShiftCount}</li>
          <li>Night shifts: {summary.nightShiftCount}</li>
          <li>Recovery days: {summary.recoveryDays}</li>
          <li>Off days: {summary.offDays}</li>
        </ul>
      </section>

      <section className="panel">
        <h2>Upcoming shifts</h2>
        <ul className="data-list">
          {upcomingEntries.map((entry) => (
            <li key={entry.key}>
              {entry.date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
              })}{' '}
              - {entry.meta.label} ({entry.meta.shortLabel})
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Shift breakdown</h2>
        <ul className="data-list">
          {shiftBreakdown.map((item) => (
            <li key={item.label}>
              {item.label}: {item.value}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel chart-panel">
        <h2>Shift breakdown chart</h2>

        <svg className="chart" width={chartWidth} height={chartHeight}>
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
                  textAnchor="middle">
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
      </section>

      <section className="panel monthly-data-panel">
        <h2>Monthly load data</h2>
        <ul className="data-list">
          {monthlyLoadData.map((item) => (
            <li key={item.label}>
              {item.label}: {item.totalHours}h / {item.workDays} work days
            </li>
          ))}
        </ul>
      </section>

      <section className="panel chart-panel">
        <h2>Monthly load chart</h2>

        <svg className="chart" width={chartWidth} height={chartHeight}>
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
                  fill="#6bd3ff"
                />
              )
            })}

          </g>
        </svg>
      </section>

    </main>
  )

}

export default App
