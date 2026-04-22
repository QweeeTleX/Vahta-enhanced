import { max, scaleBand, scaleLinear } from 'd3'
import type { MonthlyLoadItem } from '../lib/schedule'

type MonthlyLoadChartProps = {
  items: MonthlyLoadItem[]
}

const chartWidth = 520
const chartHeight = 320

const chartMargin = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 48,
}

function MonthlyLoadChart({ items }: MonthlyLoadChartProps) {
  const innerWidth = chartWidth - chartMargin.left - chartMargin.right
  const innerHeight = chartHeight - chartMargin.top - chartMargin.bottom
  const maxHours = max(items, (item) => item.totalHours) ?? 0

  const xScale = scaleBand()
    .domain(items.map((item) => item.label))
    .range([0, innerWidth])
    .padding(0.2)

  const yScale = scaleLinear()
    .domain([0, maxHours])
    .nice()
    .range([innerHeight, 0])

  const yTicks = yScale.ticks(5)

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div className="panel-heading-copy">
          <p className="eyebrow">Тренд</p>
          <h2 className="panel-title">График месячной нагрузки</h2>
          <p className="panel-text">
            Общее количество запланированных часов за последние четыре месяца для выбранной
            бригады.
          </p>
        </div>
      </div>

      <div className="chart-surface">
        <svg
          className="chart"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label="График месячной нагрузки"
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

            {items.map((item) => {
              const x = xScale(item.label) ?? 0
              const y = yScale(item.totalHours)
              const barHeight = innerHeight - y

              return (
                <rect
                  key={item.label}
                  className="chart-bar"
                  x={x}
                  y={y}
                  width={xScale.bandwidth()}
                  height={barHeight}
                  rx={12}
                  fill="var(--accent-strong)"
                />
              )
            })}

            {items.map((item) => {
              const x = xScale(item.label) ?? 0

              return (
                <text
                  key={`${item.label}-month-label`}
                  className="chart-label"
                  x={x + xScale.bandwidth() / 2}
                  y={innerHeight + 24}
                  textAnchor="middle"
                >
                  {item.label}
                </text>
              )
            })}

            {items.map((item) => {
              const x = xScale(item.label) ?? 0
              const y = yScale(item.totalHours)

              return (
                <text
                  key={`${item.label}-hours`}
                  className="chart-value"
                  x={x + xScale.bandwidth() / 2}
                  y={y - 8}
                  textAnchor="middle"
                >
                  {item.totalHours}
                </text>
              )
            })}

            {yTicks.map((tick) => {
              const y = yScale(tick)

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
  )
}

export default MonthlyLoadChart
