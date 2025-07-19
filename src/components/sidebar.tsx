"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Landmark, Users, Shield, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/admin", label: "Admin", icon: Shield, adminOnly: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-card p-4">
      <div className="flex items-center gap-2 mb-8">
        <Landmark className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-primary">Friendly LoanBuddy</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') {
            return null
          }
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-primary/10",
                isActive && "bg-primary/10 text-primary font-semibold"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
