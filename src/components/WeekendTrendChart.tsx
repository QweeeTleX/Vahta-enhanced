import { curveStepAfter, line, max, scaleLinear } from 'd3'
import type { WeekendDayShiftTrendPoint } from '../lib/schedule'

type WeekendTrendChartProps = {
  points: WeekendDayShiftTrendPoint[]
}

const chartWidth = 520
const chartHeight = 320

const chartMargin = {
  top: 20,
  right: 20,
  bottom: 40,
  left: 48,
}

function WeekendTrendChart({ points }: WeekendTrendChartProps) {
  const innerWidth = chartWidth - chartMargin.left - chartMargin.right
  const innerHeight = chartHeight - chartMargin.top - chartMargin.bottom
  const trendMax = max(points, (point) => point.total) ?? 0

  const xScale = scaleLinear()
    .domain([1, points.length])
    .range([8, innerWidth - 8])

  const yScale = scaleLinear()
    .domain([0, Math.max(trendMax, 1)])
    .nice()
    .range([innerHeight, 0])

  const yTicks = Array.from(
    { length: Math.max(trendMax, 1) + 1 },
    (_, index) => index,
  )

  const xTicks = points
    .filter((point) => point.day === 1 || point.day % 5 === 0 || point.day === points.length)
    .map((point) => point.day)

  const trendLine = line<WeekendDayShiftTrendPoint>()
    .x((point) => xScale(point.day))
    .y((point) => yScale(point.total))
    .curve(curveStepAfter)

  const trendPath = trendLine(points)

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div className="panel-heading-copy">
          <p className="eyebrow">Выходные 5/2</p>
          <h2 className="panel-title">Дневные смены на субботу и воскресенье</h2>
          <p className="panel-text">
            Этот график показывает, в какие дни месяца дневные смены выбранной бригады
            попадали в привычные выходные.
          </p>
        </div>
      </div>

      <div className="chart-surface">
        <svg
          className="chart"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          role="img"
          aria-label="График дневных смен в выходные"
        >
          <g transform={`translate(${chartMargin.left}, ${chartMargin.top})`}>
            {yTicks.map((tick) => {
              const y = yScale(tick)

              return (
                <line
                  key={`${tick}-weekend-grid`}
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
                  key={`${tick}-weekend-y-label`}
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

            {xTicks.map((tick) => {
              const x = xScale(tick)

              return (
                <text
                  key={`${tick}-weekend-x-label`}
                  className="chart-label"
                  x={x}
                  y={innerHeight + 24}
                  textAnchor="middle"
                >
                  {tick}
                </text>
              )
            })}

            <path className="chart-line" d={trendPath ?? ''} />

            {points
              .filter((point) => point.isWeekendDayShift)
              .map((point) => (
                <circle
                  key={`${point.day}-weekend-point`}
                  className="chart-point"
                  cx={xScale(point.day)}
                  cy={yScale(point.total)}
                  r={5}
                />
              ))}

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

export default WeekendTrendChart
