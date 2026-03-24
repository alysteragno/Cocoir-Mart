import SellerHeader from '@/components/adminUi/SellerHeader'
import Footer from '@/components/Footer'
export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <SellerHeader />
      <main className="flex-1 mx-auto w-full max-w-screen-xl px-4 sm:px-6 py-8">
        {children}
      </main>
      <Footer/>
    </div>
  )
}