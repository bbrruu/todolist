export type Priority = 'high' | 'medium' | 'low'
export type Status = 'pending' | 'in_progress' | 'done'

export interface Todo {
  id: string
  title: string
  description: string | null
  due_date: string | null
  due_date_end: string | null
  due_time: string | null
  priority: Priority
  status: Status
  tags: string[]
  created_at: string
  updated_at: string
}

export interface TodoFormData {
  title: string
  description: string
  due_date: string
  due_date_end: string
  due_time: string
  priority: Priority
  status: Status
  tags: string
}
