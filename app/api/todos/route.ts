import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await supabase
    .from('todos')
    .insert([{
      title: body.title,
      description: body.description || null,
      due_date: body.due_date || null,
      due_time: body.due_time || null,
      priority: body.priority || 'medium',
      status: body.status || 'pending',
      tags: body.tags
        ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : [],
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
