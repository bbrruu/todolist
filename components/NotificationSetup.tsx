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
  const [permission, setPermission] = useState<'unsupported' | 'default' | 'granted' | 'denied' | 'loading'>('loading')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setPermission('unsupported')
      return
    }
    setPermission(Notification.permission as 'default' | 'granted' | 'denied')

    // Check if there's an active push subscription in the browser
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription().then(sub => setSubscribed(!!sub))
    )
  }, [])

  const subscribe = async () => {
    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') { setPermission('denied'); return }

      const reg = await navigator.serviceWorker.ready
      const existing = await reg.pushManager.getSubscription()
      if (existing) await existing.unsubscribe()

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
      setPermission('granted')
      setSubscribed(true)
    } catch {
      setPermission('denied')
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setSubscribed(false)
    } finally {
      setLoading(false)
    }
  }

  if (permission === 'loading' || permission === 'unsupported') return null

  if (permission === 'granted' && subscribed) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg"
        onClick={unsubscribe}
        disabled={loading}
        title="關閉推播通知"
      >
        <BellRing size={13} className="text-primary" />
        通知已開啟
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg"
      onClick={subscribe}
      disabled={loading || permission === 'denied'}
      title={permission === 'denied' ? '請在瀏覽器設定中允許通知' : '開啟推播通知'}
    >
      {permission === 'denied' ? <BellOff size={13} /> : <Bell size={13} />}
      {permission === 'denied' ? '通知已封鎖' : '開啟通知'}
    </Button>
  )
}
