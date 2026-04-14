import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function getTodayStr() {
  const d = new Date()
  d.setUTCHours(d.getUTCHours() + 8)
  return d.toISOString().slice(0, 10)
}

export async function DELETE() {
  const today = getTodayStr()

  const { count, error } = await supabase
    .from('todos')
    .delete({ count: 'exact' })
    .lt('due_date', today)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: count })
}
