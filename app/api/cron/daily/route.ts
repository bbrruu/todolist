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

  // 1. Delete completed todos:
  //    - Single-date tasks: 3 days after completion (updated_at)
  //    - Range tasks: 3 days after due_date_end
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
  const threeDaysAgoDate = threeDaysAgo.toISOString().slice(0, 10)
  await supabase
    .from('todos')
    .delete()
    .eq('status', 'done')
    .or(`and(due_date_end.is.null,updated_at.lt.${threeDaysAgo.toISOString()}),due_date_end.lt.${threeDaysAgoDate}`)

  // 2. Rollover: move undone past todos to today.
  //    Skip range tasks that are still within their date range (due_date_end >= today).
  await supabase
    .from('todos')
    .update({ due_date: today })
    .lt('due_date', today)
    .neq('status', 'done')
    .or(`due_date_end.is.null,due_date_end.lt.${today}`)

  // 3. Fetch today's incomplete todos:
  //    - due_date = today (single-date and overdue range tasks after rollover)
  //    - due_date < today AND due_date_end >= today (active range tasks within their period)
  const { data: todayTodos } = await supabase
    .from('todos')
    .select('title, priority, user_id')
    .or(`due_date.eq.${today},and(due_date.lt.${today},due_date_end.gte.${today})`)
    .neq('status', 'done')
    .order('priority')

  // 4. Fetch all subscriptions that have a user_id
  const { data: subs } = await supabase
    .from('push_subscriptions')
    .select('*')
    .not('user_id', 'is', null)

  if (!subs || subs.length === 0) {
    return NextResponse.json({ message: '沒有推播訂閱' })
  }

  // Group todos by user_id
  const todosByUser: Record<string, Array<{ title: string; priority: string }>> = {}
  for (const todo of todayTodos ?? []) {
    if (!todo.user_id) continue
    if (!todosByUser[todo.user_id]) todosByUser[todo.user_id] = []
    todosByUser[todo.user_id].push(todo)
  }

  // Only send to subscriptions where the user has incomplete todos today
  const subsWithTodos = subs.filter(
    sub => todosByUser[sub.user_id as string]?.length > 0
  )

  if (subsWithTodos.length === 0) {
    return NextResponse.json({ message: '今天沒有待辦事項，跳過通知' })
  }

  const results = await Promise.allSettled(
    subsWithTodos.map(sub => {
      const userTodos = todosByUser[sub.user_id as string]
      const topItems = userTodos.slice(0, 5).map(t => `• ${t.title}`).join('\n')
      const payload = JSON.stringify({
        title: `☀️ 今天有 ${userTodos.length} 件事項`,
        body: topItems + (userTodos.length > 5 ? `\n...等 ${userTodos.length} 件` : ''),
        tag: 'daily',
        url: '/',
        sentAt: Date.now(),
      })
      return webpush.sendNotification(
        { endpoint: sub.endpoint, keys: sub.keys as { p256dh: string; auth: string } },
        payload
      )
    })
  )

  // Remove expired subscriptions (410 Gone)
  const expiredEndpoints = results
    .map((r, i) => ({ r, sub: subsWithTodos[i] }))
    .filter(({ r }) => r.status === 'rejected' && (r as PromiseRejectedResult).reason?.statusCode === 410)
    .map(({ sub }) => sub.endpoint)

  if (expiredEndpoints.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
  }

  const sent = results.filter(r => r.status === 'fulfilled').length
  return NextResponse.json({ message: `已發送 ${sent}/${subsWithTodos.length} 則通知`, removed: expiredEndpoints.length })
}
