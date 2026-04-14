import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://zebucgxarmeqmssmndkb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplYnVjZ3hhcm1lcW1zc21uZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwODI5MTYsImV4cCI6MjA5MTY1ODkxNn0.OxEaf1EQXcVRe2sLSkOgvImdEi2F9aMc64_I5piyu2o'
)

const today = new Date()
const d = (offset) => {
  const date = new Date(today)
  date.setDate(today.getDate() + offset)
  return date.toISOString().slice(0, 10)
}

const todos = [
  // 今天
  {
    title: '準備週會簡報',
    description: '整理本週進度，製作 5 頁的 PPT，重點放在專案里程碑',
    due_date: d(0), due_time: '10:00',
    priority: 'high', status: 'in_progress',
    tags: ['工作', '簡報'],
  },
  {
    title: '回覆客戶 email',
    description: null,
    due_date: d(0), due_time: '14:00',
    priority: 'high', status: 'pending',
    tags: ['工作'],
  },
  {
    title: '買晚餐食材',
    description: '雞胸肉、花椰菜、雞蛋、番茄',
    due_date: d(0), due_time: null,
    priority: 'medium', status: 'done',
    tags: ['生活'],
  },
  {
    title: '運動 30 分鐘',
    description: null,
    due_date: d(0), due_time: '19:00',
    priority: 'low', status: 'pending',
    tags: ['健康'],
  },
  // 明天
  {
    title: '繳水電費',
    description: '記得確認帳單金額',
    due_date: d(1), due_time: null,
    priority: 'high', status: 'pending',
    tags: ['生活', '財務'],
  },
  {
    title: '讀 Clean Code 第三章',
    description: null,
    due_date: d(1), due_time: '21:00',
    priority: 'medium', status: 'pending',
    tags: ['學習'],
  },
  // 後天
  {
    title: '看牙醫',
    description: '下午 3 點，診所在忠孝東路',
    due_date: d(2), due_time: '15:00',
    priority: 'high', status: 'pending',
    tags: ['健康'],
  },
  {
    title: '整理房間',
    description: null,
    due_date: d(2), due_time: null,
    priority: 'low', status: 'pending',
    tags: ['生活'],
  },
  // 本週
  {
    title: '完成 side project 登入功能',
    description: 'OAuth 串接 Google 登入，記得處理 token refresh',
    due_date: d(4), due_time: null,
    priority: 'medium', status: 'in_progress',
    tags: ['學習', '程式'],
  },
  {
    title: '和朋友吃飯',
    description: '約在東區，記得訂位',
    due_date: d(5), due_time: '18:30',
    priority: 'low', status: 'pending',
    tags: ['社交'],
  },
  // 下週
  {
    title: '季度報告截止',
    description: '需要包含財務數字、KPI 達成率、下季度規劃',
    due_date: d(8), due_time: '17:00',
    priority: 'high', status: 'pending',
    tags: ['工作'],
  },
  {
    title: '更新履歷',
    description: null,
    due_date: d(10), due_time: null,
    priority: 'medium', status: 'pending',
    tags: ['職涯'],
  },
  // 已完成
  {
    title: '設定 Todo App',
    description: '用 Next.js + Supabase 建立個人待辦系統',
    due_date: d(-1), due_time: null,
    priority: 'high', status: 'done',
    tags: ['學習', '程式'],
  },
  {
    title: '購買新的滑鼠',
    description: null,
    due_date: d(-2), due_time: null,
    priority: 'low', status: 'done',
    tags: ['生活'],
  },
]

const { data, error } = await supabase.from('todos').insert(todos).select()
if (error) {
  console.error('錯誤：', error.message)
} else {
  console.log(`成功插入 ${data.length} 筆假資料！`)
}
