'use client'

import { useState, useEffect } from 'react'
import { Todo, TodoFormData } from '@/lib/types'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TodoFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: TodoFormData) => Promise<void>
  editTodo?: Todo | null
}

const defaultForm: TodoFormData = {
  title: '',
  description: '',
  due_date: '',
  due_time: '',
  priority: 'medium',
  status: 'pending',
  tags: '',
}

export function TodoForm({ open, onClose, onSubmit, editTodo }: TodoFormProps) {
  const [form, setForm] = useState<TodoFormData>(defaultForm)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      if (editTodo) {
        setForm({
          title: editTodo.title,
          description: editTodo.description || '',
          due_date: editTodo.due_date || '',
          due_time: editTodo.due_time ? editTodo.due_time.slice(0, 5) : '',
          priority: editTodo.priority,
          status: editTodo.status,
          tags: editTodo.tags ? editTodo.tags.join(', ') : '',
        })
      } else {
        setForm(defaultForm)
      }
    }
  }, [editTodo, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)
    try {
      await onSubmit(form)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {editTodo ? '編輯事項' : '新增事項'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">標題 *</Label>
            <Input
              id="title"
              placeholder="我要做什麼..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">
              簡述
              <span className="text-muted-foreground font-normal ml-1 text-xs">（可選）</span>
            </Label>
            <Textarea
              id="description"
              placeholder="更多細節..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="due_date">日期</Label>
              <Input
                id="due_date"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="due_time">
                時間
                <span className="text-muted-foreground font-normal ml-1 text-xs">（可選）</span>
              </Label>
              <Input
                id="due_time"
                type="time"
                value={form.due_time}
                onChange={(e) => setForm({ ...form, due_time: e.target.value })}
              />
            </div>
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>優先度</Label>
              <Select
                value={form.priority}
                onValueChange={(v) => setForm({ ...form, priority: v as Todo['priority'] })}
              >
                <SelectTrigger>
                  <SelectValue>
                    {{ high: '🔴 高', medium: '🟡 中', low: '🟢 低' }[form.priority]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">🔴 高</SelectItem>
                  <SelectItem value="medium">🟡 中</SelectItem>
                  <SelectItem value="low">🟢 低</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>狀態</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as Todo['status'] })}
              >
                <SelectTrigger>
                  <SelectValue>
                    {{ pending: '待辦', in_progress: '進行中', done: '完成' }[form.status]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">待辦</SelectItem>
                  <SelectItem value="in_progress">進行中</SelectItem>
                  <SelectItem value="done">完成</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="tags">
              標籤
              <span className="text-muted-foreground font-normal ml-1 text-xs">（逗號分隔，可選）</span>
            </Label>
            <Input
              id="tags"
              placeholder="工作, 個人, 學習..."
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={loading || !form.title.trim()}>
              {loading ? '儲存中...' : editTodo ? '更新' : '新增'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
