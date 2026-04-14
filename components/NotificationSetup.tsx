'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, BellRing } from 'lucide-react'
import { Button } from '@/components/ui/button'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export function NotificationSetup() {
  const [status, setStatus] = useState<'unsupported' | 'default' | 'granted' | 'denied' | 'loading'>('loading')

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported')
    } else {
      setStatus(Notification.permission as 'default' | 'granted' | 'denied')
    }
  }, [])

  const subscribe = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setStatus('denied'); return }

      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      if (existing) await existing.unsubscribe()

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
      setStatus('granted')
    } catch {
      setStatus('denied')
    }
  }

  if (status === 'loading' || status === 'unsupported') return null

  if (status === 'granted') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <BellRing size={13} className="text-primary" />
        通知已開啟
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg"
      onClick={subscribe}
      title="開啟推播通知"
    >
      {status === 'denied' ? <BellOff size={13} /> : <Bell size={13} />}
      {status === 'denied' ? '通知已封鎖' : '開啟通知'}
    </Button>
  )
}
