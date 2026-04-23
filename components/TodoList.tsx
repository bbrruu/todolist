'use client'

import { useState, useEffect, useCallback } from 'react'
import { Todo, TodoFormData } from '@/lib/types'
import { TodoCard } from './TodoCard'
import { TodoForm } from './TodoForm'
import { FilterBar, StatusFilter, PriorityFilter, SortOption } from './FilterBar'
import { CalendarView } from './CalendarView'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, List, CalendarDays, Trash2 } from 'lucide-react'

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editTodo, setEditTodo] = useState<Todo | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('due_date_asc')
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch('/api/todos')
      if (res.ok) setTodos(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTodos() }, [fetchTodos])

  const handleAdd = async (data: TodoFormData) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) await fetchTodos()
  }

  const handleEdit = async (data: TodoFormData) => {
    if (!editTodo) return
    const res = await fetch(`/api/todos/${editTodo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) await fetchTodos()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個事項嗎？')) return
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
    if (res.ok) await fetchTodos()
  }

  const handleStatusChange = async (id: string, status: Todo['status']) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) await fetchTodos()
  }

  const handleClearPast = async () => {
    const today = new Date().toLocaleDateString('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-').replace(/(\d+)-(\d+)-(\d+)/, '$1-$2-$3')
    const pastCount = todos.filter(t => t.due_date && t.due_date < new Date().toISOString().slice(0, 10)).length
    if (pastCount === 0) { alert('沒有今天以前的事項需要清除'); return }
    if (!confirm(`確定要刪除今天（${new Date().toISOString().slice(0, 10)}）以前的 ${pastCount} 筆事項嗎？`)) return
    const res = await fetch('/api/todos/clear-past', { method: 'DELETE' })
    if (res.ok) await fetchTodos()
  }

  const handleOpenEdit = (todo: Todo) => { setEditTodo(todo); setFormOpen(true) }
  const handleCloseForm = () => { setFormOpen(false); setEditTodo(null) }

  const handleSelectDate = (date: string | null) => {
    setSelectedDate(date)
  }

  // Filter
  let filtered = todos
  if (selectedDate) {
    filtered = filtered.filter(t =>
      t.due_date === selectedDate ||
      (t.due_date && t.due_date_end && t.due_date <= selectedDate && t.due_date_end >= selectedDate)
    )
  } else {
    if (statusFilter !== 'all') filtered = filtered.filter(t => t.status === statusFilter)
    if (priorityFilter !== 'all') filtered = filtered.filter(t => t.priority === priorityFilter)
  }

  // Sort
  filtered = [...filtered].sort((a, b) => {
    switch (sortOption) {
      case 'created_asc':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'created_desc':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case 'priority':
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      case 'due_date_asc':
      default: {
        // 沒有日期的排到最底
        if (!a.due_date && !b.due_date) return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        if (!a.due_date) return 1
        if (!b.due_date) return -1
        const dateDiff = new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        // 同一天：按優先度排
        if (dateDiff === 0) return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        return dateDiff
      }
    }
  })

  const doneCount = todos.filter(t => t.status === 'done').length

  return (
    <div className="space-y-4">
      {/* 操作列：視圖切換 + 清除 + 新增（全寬，不跟篩選列搶空間） */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => { setView('list'); setSelectedDate(null) }}
            title="列表視圖"
          >
            <List size={17} />
          </Button>
          <Button
            variant={view === 'calendar' ? 'default' : 'outline'}
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => setView('calendar')}
            title="日曆視圖"
          >
            <CalendarDays size={17} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:border-destructive"
            onClick={handleClearPast}
            title="清除今天以前的事項"
          >
            <Trash2 size={17} />
          </Button>
        </div>
        {/* 新增按鈕：佔滿剩餘寬度 */}
        <Button
          onClick={() => { setEditTodo(null); setFormOpen(true) }}
          className="flex-1 h-10 gap-2 rounded-xl text-sm"
        >
          <Plus size={17} />
          新增事項
        </Button>
      </div>

      {/* 篩選列：全寬獨立一排 */}
      <div>
        <FilterBar
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          sortOption={sortOption}
          onStatusChange={(s) => { setStatusFilter(s); setSelectedDate(null) }}
          onPriorityChange={(p) => { setPriorityFilter(p); setSelectedDate(null) }}
          onSortChange={setSortOption}
          totalCount={todos.length}
          doneCount={doneCount}
        />
      </div>

      {/* Calendar view */}
      {view === 'calendar' && (
        <CalendarView
          todos={todos}
          onSelectDate={handleSelectDate}
          selectedDate={selectedDate}
        />
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-muted-foreground" size={26} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <div className="text-5xl">{todos.length === 0 ? '☕' : '🔍'}</div>
          <p className="text-muted-foreground text-sm">
            {todos.length === 0
              ? '還沒有任何事項，點右上角新增吧！'
              : selectedDate
              ? `${selectedDate} 沒有事項`
              : '沒有符合條件的事項'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <TodoForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={editTodo ? handleEdit : handleAdd}
        editTodo={editTodo}
      />
    </div>
  )
}
