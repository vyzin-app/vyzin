import { Outlet } from 'react-router-dom'
import { CondoDataProvider } from '@/app/contexts/CondoDataContext'
import { Sidebar } from '@/app/components/Sidebar'

/** Authenticated shell: sidebar + nested page outlet (parent layout). */
export function AppLayout() {
  return (
    <CondoDataProvider>
      <div className="flex h-screen bg-background">
        <div className="flex-shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </CondoDataProvider>
  )
}
