import { TodoList } from '@/components/TodoList'
import { ThemeToggle } from '@/components/ThemeToggle'
import { NotificationSetup } from '@/components/NotificationSetup'
import { UserMenu } from '@/components/UserMenu'
import { BookCheck } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center shadow-sm">
              <BookCheck size={22} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground leading-none">我的事項</h1>
              <p className="text-sm text-muted-foreground mt-0.5">今天也要加油 ☀️</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NotificationSetup />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>

        <TodoList />
      </div>
    </main>
  )
}
