import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  const sub = await request.json()

  const { error } = await supabase.from('push_subscriptions').upsert(
    { endpoint: sub.endpoint, keys: sub.keys },
    { onConflict: 'endpoint' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
