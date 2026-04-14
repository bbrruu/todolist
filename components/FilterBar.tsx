'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export type StatusFilter = 'all' | 'pending' | 'in_progress' | 'done'
export type PriorityFilter = 'all' | 'high' | 'medium' | 'low'
export type SortOption = 'created_desc' | 'created_asc' | 'due_date_asc' | 'priority'

interface FilterBarProps {
  statusFilter: StatusFilter
  priorityFilter: PriorityFilter
  sortOption: SortOption
  onStatusChange: (s: StatusFilter) => void
  onPriorityChange: (p: PriorityFilter) => void
  onSortChange: (s: SortOption) => void
  totalCount: number
  doneCount: number
}

const STATUS_LABELS: Record<StatusFilter, string> = {
  all: '全部',
  pending: '待辦',
  in_progress: '進行中',
  done: '完成',
}

const PRIORITY_LABELS: Record<PriorityFilter, string> = {
  all: '所有',
  high: '🔴 高',
  medium: '🟡 中',
  low: '🟢 低',
}

const SORT_LABELS: Record<SortOption, string> = {
  created_desc: '最新',
  created_asc: '最舊',
  due_date_asc: '到期日',
  priority: '優先度',
}

export function FilterBar({
  statusFilter,
  priorityFilter,
  sortOption,
  onStatusChange,
  onPriorityChange,
  onSortChange,
  totalCount,
  doneCount,
}: FilterBarProps) {
  const progress = totalCount > 0 ? (doneCount / totalCount) * 100 : 0

  return (
    <div className="space-y-2.5">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-primary rounded-full h-1.5 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
          {doneCount} / {totalCount} 完成
        </span>
      </div>

      {/* 單行捲動 filter bar */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {/* Status pills */}
        {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={statusFilter === s ? 'default' : 'outline'}
            className="h-7 px-3 text-xs rounded-full flex-shrink-0"
            onClick={() => onStatusChange(s)}
          >
            {STATUS_LABELS[s]}
          </Button>
        ))}

        <div className="w-px h-4 bg-border mx-0.5 flex-shrink-0" />

        {/* Priority pills */}
        {(Object.keys(PRIORITY_LABELS) as PriorityFilter[]).map((p) => (
          <Button
            key={p}
            size="sm"
            variant={priorityFilter === p ? 'default' : 'outline'}
            className="h-7 px-3 text-xs rounded-full flex-shrink-0"
            onClick={() => onPriorityChange(p)}
          >
            {PRIORITY_LABELS[p]}
          </Button>
        ))}

        <div className="w-px h-4 bg-border mx-0.5 flex-shrink-0" />

        {/* Sort dropdown */}
        <div className="flex-shrink-0">
          <Select value={sortOption} onValueChange={(v) => onSortChange(v as SortOption)}>
            <SelectTrigger className="h-7 text-xs w-24 rounded-full">
              <SelectValue>{SORT_LABELS[sortOption]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_desc">最新優先</SelectItem>
              <SelectItem value="created_asc">最舊優先</SelectItem>
              <SelectItem value="due_date_asc">到期日</SelectItem>
              <SelectItem value="priority">優先度</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
