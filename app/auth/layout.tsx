import Header from '@/components/Header'
import Footer from '@/components/Footer'
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <Header minimal/>
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}