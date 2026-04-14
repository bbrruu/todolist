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

const STATUS_ITEMS: { value: StatusFilter; label: string }[] = [
  { value: 'all',        label: '全部'   },
  { value: 'pending',    label: '待辦'   },
  { value: 'in_progress',label: '進行中' },
  { value: 'done',       label: '完成'   },
]

const PRIORITY_ITEMS: { value: PriorityFilter; label: string }[] = [
  { value: 'all',    label: '全部' },
  { value: 'high',   label: '🔴 高' },
  { value: 'medium', label: '🟡 中' },
  { value: 'low',    label: '🟢 低' },
]

const SORT_LABELS: Record<SortOption, string> = {
  created_desc:  '最新',
  created_asc:   '最舊',
  due_date_asc:  '到期日',
  priority:      '優先度',
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
    <div className="space-y-2">
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

      {/* 第一排：狀態（均分滿版） */}
      <div className="flex gap-1">
        {STATUS_ITEMS.map(({ value, label }) => (
          <Button
            key={value}
            size="sm"
            variant={statusFilter === value ? 'default' : 'outline'}
            className="flex-1 h-7 px-0 text-xs rounded-lg"
            onClick={() => onStatusChange(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* 第二排：優先度（均分）＋ 排序下拉 */}
      <div className="flex gap-1">
        {PRIORITY_ITEMS.map(({ value, label }) => (
          <Button
            key={value}
            size="sm"
            variant={priorityFilter === value ? 'default' : 'outline'}
            className="flex-1 h-7 px-0 text-xs rounded-lg"
            onClick={() => onPriorityChange(value)}
          >
            {label}
          </Button>
        ))}
        <Select value={sortOption} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="h-7 text-xs w-20 flex-shrink-0 rounded-lg">
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
  )
}
