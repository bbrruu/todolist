'use client'

import { useState } from 'react'
import { Todo } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Pencil, Trash2, Tag, CheckCircle2, Circle, Timer } from 'lucide-react'

interface TodoCardProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: Todo['status']) => void
}

const priorityConfig = {
  high: {
    label: '高優先',
    badge: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50',
    border: 'border-l-red-400',
  },
  medium: {
    label: '中優先',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50',
    border: 'border-l-amber-400',
  },
  low: {
    label: '低優先',
    badge: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50',
    border: 'border-l-green-400',
  },
}

const statusConfig = {
  pending: {
    label: '待辦',
    Icon: Circle,
    color: 'text-stone-400',
    next: 'in_progress' as Todo['status'],
  },
  in_progress: {
    label: '進行中',
    Icon: Timer,
    color: 'text-amber-500',
    next: 'done' as Todo['status'],
  },
  done: {
    label: '完成',
    Icon: CheckCircle2,
    color: 'text-emerald-500',
    next: 'pending' as Todo['status'],
  },
}

export function TodoCard({ todo, onEdit, onDelete, onStatusChange }: TodoCardProps) {
  const [showActions, setShowActions] = useState(false)
  const { Icon, color, next } = statusConfig[todo.status]
  const { border } = priorityConfig[todo.priority]

  return (
    <div
      className={`
        group bg-card rounded-2xl border border-border border-l-4 ${border}
        px-4 py-3.5 shadow-sm hover:shadow-md transition-all duration-200
        ${todo.status === 'done' ? 'opacity-60' : ''}
      `}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        {/* Status toggle button */}
        <button
          onClick={() => onStatusChange(todo.id, next)}
          className={`mt-0.5 flex-shrink-0 transition-all duration-150 hover:scale-110 ${color}`}
          title="點擊切換狀態"
        >
          <Icon size={20} />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`
            font-semibold text-foreground leading-snug
            ${todo.status === 'done' ? 'line-through text-muted-foreground' : ''}
          `}>
            {todo.title}
          </h3>

          {todo.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {todo.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
            {todo.due_date && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar size={11} />
                {formatDate(todo.due_date)}
              </span>
            )}
            {todo.due_time && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock size={11} />
                {todo.due_time.slice(0, 5)}
              </span>
            )}
            <Badge variant="outline" className={`text-xs px-2 py-0 h-5 ${priorityConfig[todo.priority].badge}`}>
              {priorityConfig[todo.priority].label}
            </Badge>
            <Badge variant="outline" className="text-xs px-2 py-0 h-5">
              {statusConfig[todo.status].label}
            </Badge>
          </div>

          {/* Tags */}
          {todo.tags && todo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {todo.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-0.5 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full"
                >
                  <Tag size={9} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons — visible on hover */}
        <div className={`flex gap-0.5 flex-shrink-0 transition-opacity duration-150 ${showActions ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(todo)}
            title="編輯"
          >
            <Pencil size={13} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(todo.id)}
            title="刪除"
          >
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return `${date.getMonth() + 1}月${date.getDate()}日`
}
