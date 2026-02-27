import type { NextRequest } from 'next/server'

export function middleware(_req: NextRequest) {
  // TODO: Add real role-based checks using Supabase auth helpers or JWT.
  // For now, this file exists to show where you'd protect /seller routes.
}

export const config = {
  matcher: ['/seller/:path*']
}
