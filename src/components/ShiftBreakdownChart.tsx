import { max, scaleBand, scaleLinear } from 'd3'
import type { ShiftBreakdownItem } from '../lib/schedule'

type ShiftBreakdownChartProps = {
  items: ShiftBreakdownItem[]
}

const chartWidth = 520
const chartHeight = 320

const chartMargin = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 48,
}

function ShiftBreakdownChart({ items }: ShiftBreakdownChartProps) {
  const innerWidth = chartWidth - chartMargin.left - chartMargin.right
  const innerHeight = chartHeight - chartMargin.top - chartMargin.bottom
  const maxValue = max(items, (item) => item.value) ?? 0

  const xScale = scaleBand()
    .domain(items.map((item) => item.label))
    .range([0, innerWidth])
    .padding(0.2)

  const yScale = scaleLinear()
    .domain([0, maxValue])
    .nice()
    .range([innerHeight, 0])

  const yTicks = yScale.ticks(5)

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div className="panel-heading-copy">
          <p className="eyebrow">Текущий месяц</p>
          <h2 className="panel-title">Состав смен</h2>
          <p className="panel-text">
            Распределение дневных, ночных, отсыпных и выходных дней в активном месяце.
          </p>
        </div>
      </div>

      <div className="chart-surface">
        <svg
          className="chart"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label="График состава смен"
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

            {items.map((item) => {
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

            {items.map((item) => {
              const x = xScale(item.label) ?? 0

              return (
                <text
                  className="chart-label"
                  key={`${item.label}-item-label`}
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
  )
}

export default ShiftBreakdownChart
