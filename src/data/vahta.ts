export type TeamId = 1 | 2 | 3 | 4

export type WorkShiftCode = 'D1' | 'D2' | 'N1' | 'N2'
export type ShiftCode = WorkShiftCode | 'RECOVERY' | 'OFF'

export type ShiftCategory = 'day' | 'night' | 'recovery' | 'off'

export type ShiftMeta = {
  label: string
  shortLabel: string
  hours: number
  category: ShiftCategory
  color: string
}

export const teams = [
  { id: 1 as const, label: 'Бригада 1' },
  { id: 2 as const, label: 'Бригада 2' },
  { id: 3 as const, label: 'Бригада 3' },
  { id: 4 as const, label: 'Бригада 4' },
]

export const cycleStart = new Date(2025, 10, 26)

export const cycles: Record<TeamId, ShiftCode[]> = {
  1: ['RECOVERY', 'OFF', 'D1', 'D2', 'OFF', 'OFF', 'N1', 'N2'],
  2: ['D1', 'D2', 'OFF', 'OFF', 'N1', 'N2', 'RECOVERY', 'OFF'],
  3: ['N1', 'N2', 'RECOVERY', 'OFF', 'D1', 'D2', 'OFF', 'OFF'],
  4: ['OFF', 'OFF', 'N1', 'N2', 'RECOVERY', 'OFF', 'D1', 'D2'],
}

export const overrideShiftCodes: ShiftCode[] = [
  'D1',
  'D2',
  'N1',
  'N2',
  'RECOVERY',
  'OFF',
]

export const shiftMeta: Record<ShiftCode, ShiftMeta> = {
  D1: {
    label: 'Дневная смена 1',
    shortLabel: 'D1',
    hours: 12,
    category: 'day',
    color: '#f5e48a',
  },
  D2: {
    label: 'Дневная смена 2',
    shortLabel: 'D2',
    hours: 12,
    category: 'day',
    color: '#ffe57b',
  },
  N1: {
    label: 'Ночная смена 1',
    shortLabel: 'N1',
    hours: 12,
    category: 'night',
    color: '#9fd7ff',
  },
  N2: {
    label: 'Ночная смена 2',
    shortLabel: 'N2',
    hours: 12,
    category: 'night',
    color: '#84c6ff',
  },
  RECOVERY: {
    label: 'Отсыпной',
    shortLabel: 'Отс.',
    hours: 0,
    category: 'recovery',
    color: '#7f8aa3',
  },
  OFF: {
    label: 'Выходной',
    shortLabel: 'Вых.',
    hours: 0,
    category: 'off',
    color: '#575f70',
  },
}
