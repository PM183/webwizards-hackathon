import { Header } from '../../components/layout/Header'
import { PollsProvider } from '../../components/polls/PollsProvider'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PollsProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </PollsProvider>
  )
}