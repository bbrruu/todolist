'use client'

import { useState, useMemo } from 'react'
import { Todo } from '@/lib/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CalendarViewProps {
  todos: Todo[]
  onSelectDate: (date: string | null) => void
  selectedDate: string | null
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-400',
  medium: 'bg-amber-400',
  low: 'bg-green-400',
}

function toLocalDateStr(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function CalendarView({ todos, onSelectDate, selectedDate }: CalendarViewProps) {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const todayStr = toLocalDateStr(today)

  // Group todos by due_date
  const todosByDate = useMemo(() => {
    const map: Record<string, Todo[]> = {}
    todos.forEach((t) => {
      if (t.due_date) {
        if (!map[t.due_date]) map[t.due_date] = []
        map[t.due_date].push(t)
      }
    })
    return map
  }, [todos])

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={prevMonth}>
          <ChevronLeft size={15} />
        </Button>
        <span className="font-semibold text-sm text-foreground">
          {viewYear} 年 {viewMonth + 1} 月
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={nextMonth}>
          <ChevronRight size={15} />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-medium py-1 ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-muted-foreground'}`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />

          const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayTodos = todosByDate[dateStr] ?? []
          const isToday = dateStr === todayStr
          const isSelected = dateStr === selectedDate
          const hasDone = dayTodos.every(t => t.status === 'done') && dayTodos.length > 0
          const weekday = (idx % 7)

          return (
            <button
              key={idx}
              onClick={() => onSelectDate(isSelected ? null : dateStr)}
              className={`
                relative flex flex-col items-center py-1 rounded-xl transition-all
                ${isSelected ? 'bg-primary text-primary-foreground' : isToday ? 'bg-muted font-bold' : 'hover:bg-muted/60'}
                ${weekday === 0 ? 'text-red-500' : weekday === 6 ? 'text-blue-500' : 'text-foreground'}
                ${isSelected ? '!text-primary-foreground' : ''}
              `}
            >
              <span className="text-xs leading-5">{day}</span>
              {dayTodos.length > 0 && (
                <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[20px]">
                  {dayTodos.slice(0, 3).map((t, i) => (
                    <span
                      key={i}
                      className={`w-1 h-1 rounded-full ${isSelected ? 'bg-primary-foreground/70' : hasDone ? 'bg-emerald-400' : PRIORITY_DOT[t.priority]}`}
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {selectedDate && (
        <p className="text-xs text-center text-muted-foreground mt-3">
          {selectedDate} 共 {todosByDate[selectedDate]?.length ?? 0} 件事項
          <button className="ml-2 underline" onClick={() => onSelectDate(null)}>清除篩選</button>
        </p>
      )}
    </div>
  )
}
