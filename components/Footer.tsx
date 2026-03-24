export default function Footer() {
  return (
    <footer className="border-t border-amber-100 bg-amber-50 py-4" style={{ fontFamily: "'Georgia', serif" }} >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-1">
       <p className="text-xs text-stone-400">
  © {new Date().getFullYear()} Cocoir-Mart · Developed by <span className="font-semibold text-stone-500">Popeyes</span>
</p>
        <p className="text-xs text-stone-400">
         For educational purposes only. No copyright infringement intended.
        </p>
      </div>
    </footer>
  )
}