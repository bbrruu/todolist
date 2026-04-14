'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return null

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const initial = (user.user_metadata?.full_name as string)?.[0]?.toUpperCase()
    ?? user.email?.[0]?.toUpperCase()
    ?? '?'

  return (
    <div className="flex items-center gap-0.5">
      <div className="w-8 h-8 rounded-full overflow-hidden bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold flex-shrink-0">
        {avatarUrl ? (
          <Image src={avatarUrl} width={32} height={32} alt="avatar" className="object-cover" />
        ) : initial}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
        onClick={handleSignOut}
        title="登出"
      >
        <LogOut size={15} />
      </Button>
    </div>
  )
}
