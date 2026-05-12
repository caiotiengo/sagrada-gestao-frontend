'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Users,
  Mail,
  LogOut,
  Menu,
  ChevronRight,
  ChevronDown,
  DollarSign,
  CalendarDays,
  UserCheck,
  Heart,
  List,
  Ticket,
  ShoppingBag,
  ShoppingCart,
  StickyNote,
  Store,
  UtensilsCrossed,
  Globe,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { APP_NAME, ROLE_LABELS, ROUTES } from '@/constants'
import { cn } from '@/lib/utils'
import { getInitials } from '@/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  permission?: string
}

interface NavGroup {
  label: string
  icon: React.ElementType
  children: NavItem[]
}

type NavEntry = NavItem | NavGroup

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry
}

const adminNavItems: NavEntry[] = [
  { label: 'Home', href: ROUTES.ADMIN_HOME, icon: Home },
  { label: 'Membros', href: ROUTES.MEMBERS_LIST, icon: Users },
  { label: 'Convites', href: ROUTES.INVITES, icon: Mail },
  { label: 'Financeiro', href: ROUTES.ADMIN_FINANCE, icon: DollarSign },
  { label: 'Calendário', href: ROUTES.ADMIN_CALENDAR, icon: CalendarDays },
  { label: 'Check-ins', href: ROUTES.ADMIN_CHECKINS, icon: UserCheck },
  { label: 'Listas', href: ROUTES.ADMIN_CAMPAIGNS, icon: List },
  { label: 'Rifas', href: ROUTES.ADMIN_RAFFLES, icon: Ticket },
  {
    label: 'Vendas',
    icon: ShoppingBag,
    children: [
      { label: 'Loja', href: ROUTES.ADMIN_STORE, icon: ShoppingBag },
      { label: 'Cantina', href: ROUTES.ADMIN_CANTEEN, icon: UtensilsCrossed },
    ],
  },
  { label: 'Site', href: ROUTES.ADMIN_SITE, icon: Globe },
]

const memberNavItems: NavEntry[] = [
  { label: 'Home', href: ROUTES.MEMBER_HOME, icon: Home },
  { label: 'Financeiro', href: ROUTES.MEMBER_FINANCE, icon: DollarSign },
  { label: 'Calendário', href: ROUTES.MEMBER_CALENDAR, icon: CalendarDays },
  { label: 'Listas', href: ROUTES.MEMBER_CAMPAIGNS, icon: List },
  { label: 'Rifas', href: ROUTES.MEMBER_RAFFLES, icon: Ticket },
  {
    label: 'Vendas',
    icon: ShoppingBag,
    children: [
      { label: 'Loja', href: ROUTES.MEMBER_LOJA, icon: ShoppingBag },
      { label: 'Cantina', href: ROUTES.MEMBER_STORE, icon: UtensilsCrossed },
    ],
  },
  { label: 'Compras', href: ROUTES.MEMBER_SHOPPING, icon: ShoppingCart },
  { label: 'Notas', href: ROUTES.MEMBER_NOTES, icon: StickyNote },
]

// Admin pages accessible to members with specific permissions
const permissionNavItems: NavItem[] = [
  { label: 'Gerenciar Caixa', href: ROUTES.ADMIN_FINANCE, icon: DollarSign, permission: 'canManageCashier' },
  { label: 'Gerenciar Membros', href: ROUTES.MEMBERS_LIST, icon: Users, permission: 'canManageMembers' },
  { label: 'Gerenciar Calendário', href: ROUTES.ADMIN_CALENDAR, icon: CalendarDays, permission: 'canManageCalendar' },
  { label: 'Gerenciar Listas', href: ROUTES.ADMIN_CAMPAIGNS, icon: List, permission: 'canManageCampaigns' },
  { label: 'Gerenciar Rifas', href: ROUTES.ADMIN_RAFFLES, icon: Ticket, permission: 'canManageRaffles' },
  { label: 'Gerenciar Loja', href: ROUTES.ADMIN_STORE, icon: ShoppingBag, permission: 'canRegisterSales' },
  { label: 'Gerenciar Cantina', href: ROUTES.ADMIN_CANTEEN, icon: UtensilsCrossed, permission: 'canRegisterSales' },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, currentHouse, clearAuth } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const isAdmin = currentHouse?.role === 'admin'
  const extraPerms = currentHouse?.extraPermissions ?? []
  const memberExtraNav = !isAdmin
    ? permissionNavItems.filter((item) => item.permission && extraPerms.includes(item.permission as never))
    : []
  // Filter Cantina out of "Vendas" submenu for members without canRegisterSales
  const canRegisterSales = isAdmin || extraPerms.includes('canRegisterSales' as never)
  const filteredMemberNavItems: NavEntry[] = memberNavItems.map((entry) => {
    if (isNavGroup(entry) && entry.label === 'Vendas') {
      const children = entry.children.filter((c) => c.href !== ROUTES.MEMBER_STORE || canRegisterSales)
      return { ...entry, children }
    }
    return entry
  })
  const navItems: NavEntry[] = isAdmin ? adminNavItems : filteredMemberNavItems

  // Auto-expand group if current path matches a child
  useEffect(() => {
    const items = isAdmin ? adminNavItems : filteredMemberNavItems
    for (const entry of items) {
      if (isNavGroup(entry)) {
        const hasActiveChild = entry.children.some((child) => pathname.startsWith(child.href))
        if (hasActiveChild) {
          setExpandedGroups((prev) =>
            prev.includes(entry.label) ? prev : [...prev, entry.label],
          )
        }
      }
    }
  }, [pathname, isAdmin])
  const roleLabel = currentHouse?.role ? ROLE_LABELS[currentHouse.role] ?? currentHouse.role : ''

  const handleLogout = () => {
    clearAuth()
    router.push(ROUTES.LOGIN)
  }

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const isActiveRoute = (href: string) => {
    if (href === ROUTES.ADMIN_HOME || href === ROUTES.MEMBER_HOME) {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label],
    )
  }

  const NavLink = ({ item, mobile = false }: { item: NavItem; mobile?: boolean }) => {
    const active = isActiveRoute(item.href)
    return (
      <Link
        href={item.href}
        className={cn(
          'group flex items-center gap-3 rounded-lg px-3 text-[0.8125rem] font-medium transition-all duration-150',
          mobile ? 'justify-between py-2.5' : 'py-2',
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        <span className="flex items-center gap-3">
          <item.icon className={cn('size-[18px] shrink-0', active && 'text-primary')} />
          {item.label}
        </span>
        {mobile && <ChevronRight className="size-4 opacity-30" />}
      </Link>
    )
  }

  const NavGroupToggle = ({ group, mobile = false }: { group: NavGroup; mobile?: boolean }) => {
    const isExpanded = expandedGroups.includes(group.label)
    const hasActiveChild = group.children.some((child) => isActiveRoute(child.href))

    return (
      <div>
        <button
          type="button"
          onClick={() => toggleGroup(group.label)}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 text-[0.8125rem] font-medium transition-all duration-150',
            mobile ? 'justify-between py-2.5' : 'py-2',
            hasActiveChild
              ? 'text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <span className="flex items-center gap-3">
            <group.icon className={cn('size-[18px] shrink-0', hasActiveChild && 'text-primary')} />
            {group.label}
          </span>
          <ChevronDown
            className={cn(
              'size-4 shrink-0 transition-transform duration-200',
              isExpanded && 'rotate-180',
              hasActiveChild ? 'text-primary/50' : 'opacity-40',
            )}
          />
        </button>
        {isExpanded && (
          <div className="ml-5 mt-0.5 flex flex-col gap-0.5 border-l border-border/50 pl-2">
            {group.children.map((child) => (
              <NavLink key={child.href} item={child} mobile={mobile} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderNavEntry = (entry: NavEntry, mobile = false) => {
    if (isNavGroup(entry)) {
      return <NavGroupToggle key={entry.label} group={entry} mobile={mobile} />
    }
    return <NavLink key={entry.href} item={entry} mobile={mobile} />
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        {/* Sidebar Header */}
        <div className="flex h-14 items-center gap-2.5 px-4">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-3.5"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5Z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
            {APP_NAME}
          </span>
        </div>

        <Separator />

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-0.5 p-2.5">
          {navItems.map((entry) => renderNavEntry(entry))}
          {memberExtraNav.length > 0 && (
            <>
              <Separator className="my-2" />
              <span className="mb-1 px-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                Gestão
              </span>
              {memberExtraNav.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </>
          )}
        </nav>

        {/* Sidebar Footer - User info */}
        <div className="border-t border-sidebar-border p-2.5">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <Avatar size="default">
              {profile?.photoUrl && <AvatarImage src={profile.photoUrl} alt={profile.fullName} />}
              <AvatarFallback>
                {profile?.fullName ? getInitials(profile.fullName) : '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 truncate">
              <p className="truncate text-[0.8125rem] font-medium text-sidebar-foreground">
                {profile?.fullName}
              </p>
              <p className="truncate text-[0.6875rem] text-sidebar-foreground/50">
                {roleLabel}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              aria-label="Sair"
              className="text-sidebar-foreground/40 hover:text-destructive"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex h-13 items-center justify-between border-b border-border/80 bg-background/90 px-4 backdrop-blur-lg lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" aria-label="Menu" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="border-b border-border px-4 py-3.5">
                <SheetTitle className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5Z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold tracking-tight">{APP_NAME}</span>
                </SheetTitle>
              </SheetHeader>

              {/* Mobile Nav Items */}
              <nav className="flex flex-col gap-0.5 p-2.5">
                {navItems.map((entry) => renderNavEntry(entry, true))}
                {memberExtraNav.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <span className="mb-1 px-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground/50">
                      Gestão
                    </span>
                    {memberExtraNav.map((item) => (
                      <NavLink key={item.href} item={item} mobile />
                    ))}
                  </>
                )}
              </nav>

              {/* Mobile menu footer */}
              <div className="mt-auto border-t border-border p-2.5">
                <div className="flex items-center gap-2.5 px-2 py-2">
                  <Avatar size="default">
                    {profile?.photoUrl && (
                      <AvatarImage src={profile.photoUrl} alt={profile.fullName} />
                    )}
                    <AvatarFallback>
                      {profile?.fullName ? getInitials(profile.fullName) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 truncate">
                    <p className="truncate text-[0.8125rem] font-medium">{profile?.fullName}</p>
                    <p className="truncate text-[0.6875rem] text-muted-foreground">
                      {roleLabel}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="mt-1 w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="size-4" />
                  Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <span className="text-sm font-semibold tracking-tight text-foreground">{APP_NAME}</span>

          <Avatar size="default">
            {profile?.photoUrl && <AvatarImage src={profile.photoUrl} alt={profile?.fullName} />}
            <AvatarFallback>
              {profile?.fullName ? getInitials(profile.fullName) : '?'}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
