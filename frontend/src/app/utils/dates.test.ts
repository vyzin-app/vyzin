import { describe, expect, it } from 'vitest'
import { isVisitSlotInPast, todayISO } from './dates'

describe('isVisitSlotInPast', () => {
  it('returns true for yesterday', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const date = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
    expect(isVisitSlotInPast(date, '10:00')).toBe(true)
  })

  it('returns false for tomorrow', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const date = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`
    expect(isVisitSlotInPast(date, '10:00')).toBe(false)
  })

  it('todayISO matches local date format', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
