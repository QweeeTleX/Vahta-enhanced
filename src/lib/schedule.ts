import {
  cycleStart,
  cycles,
  shiftMeta,
  type ShiftCode,
  type TeamId,
} from '../data/vahta'

export type ScheduleEntry = {
  key: string
  date: Date
  code: ShiftCode
  meta: (typeof shiftMeta)[ShiftCode]
}

export type MonthSummary = {
  totalHours: number
  workDays: number
  dayShiftCount: number
  nightShiftCount: number
  recoveryDays: number
  offDays: number
}

export type ShiftBreakdownItem = {
	label: string
	value: number
	color: string
}

export type MonthlyLoadItem = {
  label: string
  totalHours: number
  workDays: number
}

export type WeekendDayShiftTrendPoint = {
  day: number
  total: number
  isWeekendDayShift: boolean
}

export function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function daysBetween(a: Date, b: Date): number {
  return Math.floor(
    (Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) -
      Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) /
      86400000,
  )
}

export function getShift(date: Date, team: TeamId): ShiftCode {
  const cycle = cycles[team]
  const daysPassed = daysBetween(date, cycleStart)
  const index = ((daysPassed % cycle.length) + cycle.length) % cycle.length

  return cycle[index]
}

export function buildMonthSchedule(
  year: number,
  month: number,
  team: TeamId,
): ScheduleEntry[] {
  const lastDay = new Date(year, month + 1, 0).getDate()
  const entries: ScheduleEntry[] = []

  for (let day = 1; day <= lastDay; day += 1) {
    const date = new Date(year, month, day)
    const code = getShift(date, team)

    entries.push({
      key: dateKey(date),
      date,
      code,
      meta: shiftMeta[code],
    })
  }

  return entries
}

export function summarizeMonth(entries: ScheduleEntry[]): MonthSummary {
  return entries.reduce<MonthSummary>(
    (summary, entry) => {
      summary.totalHours += entry.meta.hours

      if (entry.meta.category === 'day') {
        summary.dayShiftCount += 1
        summary.workDays += 1
      }

      if (entry.meta.category === 'night') {
        summary.nightShiftCount += 1
        summary.workDays += 1
      }

      if (entry.meta.category === 'recovery') {
        summary.recoveryDays += 1
      }

      if (entry.meta.category === 'off') {
        summary.offDays += 1
      }

      return summary
    },
    {
      totalHours: 0,
      workDays: 0,
      dayShiftCount: 0,
      nightShiftCount: 0,
      recoveryDays: 0,
      offDays: 0,
    },
  )
}

export function buildShiftBreakdown(entries: ScheduleEntry[]): ShiftBreakdownItem[] {
  let dayCount = 0
  let nightCount = 0
  let recoveryCount = 0
  let offCount = 0

  for (const entry of entries) {
    if (entry.meta.category === 'day') {
      dayCount += 1
    }

    if (entry.meta.category === 'night') {
      nightCount += 1
    }

    if (entry.meta.category === 'recovery') {
      recoveryCount += 1
    }

    if (entry.meta.category === 'off') {
      offCount += 1
    }
  }

  return [
    { label: 'День', value: dayCount, color: '#f5e48a' },
    { label: 'Ночь', value: nightCount, color: '#9fd7ff' },
    { label: 'Отсыпной', value: recoveryCount, color: '#7f8aa3' },
    { label: 'Выходной', value: offCount, color: '#575f70' },
  ]
}

export function buildMonthlyLoadData(
  baseDate: Date,
  team: TeamId,
  monthsCount: number,
): MonthlyLoadItem[] {
  const items: MonthlyLoadItem[] = []

  for (let offset = monthsCount - 1; offset >= 0; offset -= 1) {
    const current = new Date(baseDate.getFullYear(), baseDate.getMonth() - offset, 1)

    const entries = buildMonthSchedule(
      current.getFullYear(),
      current.getMonth(),
      team,
    )

    const summary = summarizeMonth(entries)

    items.push({
      label: current.toLocaleDateString('ru-RU', { month: 'short' }),
      totalHours: summary.totalHours,
      workDays: summary.workDays,
    })
  }

  return items
}

export function buildWeekendDayShiftTrend(
  entries: ScheduleEntry[],
): WeekendDayShiftTrendPoint[] {
  let total = 0

  return entries.map((entry) => {
    const dayOfWeek = entry.date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isWeekendDayShift = isWeekend && entry.meta.category === 'day'

    if (isWeekendDayShift) {
      total += 1
    }

    return {
      day: entry.date.getDate(),
      total,
      isWeekendDayShift,
    }
  })
}
