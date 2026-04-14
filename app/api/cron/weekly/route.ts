import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

function getTaiwanDate(offsetDays = 0) {
  const d = new Date()
  d.setUTCHours(d.getUTCHours() + 8)
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

export async function GET(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Next week: Monday to Sunday
  const todayTW = new Date()
  todayTW.setUTCHours(todayTW.getUTCHours() + 8)
  const dayOfWeek = todayTW.getDay() // 0=Sun

  // Days until next Monday
  const daysToMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  const nextMonday = getTaiwanDate(daysToMonday)
  const nextSunday = getTaiwanDate(daysToMonday + 6)

  const supabase = createServiceClient()

  const { data: nextWeekTodos } = await supabase
    .from('todos')
    .select('title, due_date, priority')
    .gte('due_date', nextMonday)
    .lte('due_date', nextSunday)
    .neq('status', 'done')
    .order('due_date')

  const { data: subs } = await supabase.from('push_subscriptions').select('*')
  if (!subs || subs.length === 0) {
    return NextResponse.json({ message: '沒有推播訂閱' })
  }

  const count = nextWeekTodos?.length ?? 0
  const topItems = (nextWeekTodos ?? []).slice(0, 5).map(t => `• ${t.title}`).join('\n')
  const payload = JSON.stringify({
    title: count > 0 ? `📅 下禮拜有 ${count} 件事項` : '📅 下禮拜目前沒有事項',
    body: count > 0 ? topItems + (count > 5 ? `\n...等 ${count} 件` : '') : '趁現在規劃一下吧！',
    tag: 'weekly',
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
  return NextResponse.json({ message: `已發送 ${sent}/${subs.length} 則通知` })
}
