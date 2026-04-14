import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

function getTaiwanDateStr(offsetDays = 0) {
  const d = new Date()
  d.setUTCHours(d.getUTCHours() + 8)
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export async function GET(request: Request) {
  // Verify cron secret
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const today = getTaiwanDateStr()
  const yesterday = getTaiwanDateStr(-1)

  // 1. Rollover: move yesterday's undone todos to today
  await supabase
    .from('todos')
    .update({ due_date: today })
    .lt('due_date', today)
    .neq('status', 'done')

  // 2. Fetch today's todos for notification
  const { data: todayTodos } = await supabase
    .from('todos')
    .select('title, priority, status')
    .eq('due_date', today)
    .neq('status', 'done')
    .order('priority')

  if (!todayTodos || todayTodos.length === 0) {
    return NextResponse.json({ message: '今天沒有待辦事項，跳過通知' })
  }

  // 3. Fetch all subscriptions and send
  const { data: subs } = await supabase.from('push_subscriptions').select('*')
  if (!subs || subs.length === 0) {
    return NextResponse.json({ message: '沒有推播訂閱' })
  }

  const topItems = todayTodos.slice(0, 5).map(t => `• ${t.title}`).join('\n')
  const payload = JSON.stringify({
    title: `☀️ 今天有 ${todayTodos.length} 件事項`,
    body: topItems + (todayTodos.length > 5 ? `\n...等 ${todayTodos.length} 件` : ''),
    tag: 'daily',
    url: '/',
  })

  const results = await Promise.allSettled(
    subs.map(sub =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys },
        payload
      )
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ message: `已發送 ${sent}/${subs.length} 則通知`, rolled: yesterday })
}
