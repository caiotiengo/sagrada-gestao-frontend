'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  List,
  Ticket,
  ShoppingBag,
  ShoppingCart,
  StickyNote,
  UtensilsCrossed,
  Globe,
  Megaphone,
  Send,
  HandCoins,
  QrCode,
  UserCog,
  CreditCard,
  Receipt,
  Wallet,
  ArrowLeftRight,
  HandHeart,
  Landmark,
  NotebookPen,
} from 'lucide-react'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { BillingAlerts } from '@/components/billing/billing-alerts'
import { HouseSwitcher } from '@/components/layout/house-switcher'
import { useAuthStore } from '@/stores/auth'
import { useLogout } from '@/hooks/use-auth'
import { usePendingReceiptsCount } from '@/hooks/use-receipts'
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

/**
 * Nome único de cada página de gestão: o menu da Liderança e o "Gestão da casa"
 * de quem tem permissão extra usam o mesmo rótulo para a mesma página.
 */
const NAV = {
  members: { label: 'Membros', href: ROUTES.MEMBERS_LIST, icon: Users },
  invites: { label: 'Convites', href: ROUTES.INVITES, icon: Mail },
  checkins: { label: 'Presenças', href: ROUTES.ADMIN_CHECKINS, icon: UserCheck },
  finance: { label: 'Mensalidades e caixa', href: ROUTES.ADMIN_FINANCE, icon: DollarSign },
  receipts: { label: 'Comprovantes PIX', href: ROUTES.ADMIN_RECEIPTS, icon: Receipt },
  // Cobrança entre filhos e pedido de reembolso à casa (não é mensalidade).
  adminCharges: { label: 'Acertos e reembolsos', href: ROUTES.ADMIN_MEMBER_CHARGES, icon: ArrowLeftRight },
  calendar: { label: 'Calendário', href: ROUTES.ADMIN_CALENDAR, icon: CalendarDays },
  notices: { label: 'Avisos', href: ROUTES.ADMIN_NOTICES, icon: Megaphone },
  notify: { label: 'Enviar notificação', href: ROUTES.ADMIN_NOTIFICATIONS, icon: Send },
  campaigns: { label: 'Listas e campanhas', href: ROUTES.ADMIN_CAMPAIGNS, icon: List },
  raffles: { label: 'Rifas', href: ROUTES.ADMIN_RAFFLES, icon: Ticket },
  store: { label: 'Loja', href: ROUTES.ADMIN_STORE, icon: ShoppingBag },
  canteen: { label: 'Cantina', href: ROUTES.ADMIN_CANTEEN, icon: UtensilsCrossed },
  site: { label: 'Site da casa', href: ROUTES.ADMIN_SITE, icon: Globe },
  pix: { label: 'Chave PIX', href: ROUTES.ADMIN_PIX, icon: QrCode },
  billing: { label: 'Plano e cobrança', href: ROUTES.ADMIN_BILLING, icon: CreditCard },
} satisfies Record<string, NavItem>

/** O que a própria pessoa deve à casa (mensalidade, fiado, rifa, comprovantes). */
const MY_DEBTS: NavItem = { label: 'O que eu devo', href: ROUTES.MEMBER_FINANCE, icon: Wallet }

const adminNavItems: NavEntry[] = [
  { label: 'Início', href: ROUTES.ADMIN_HOME, icon: Home },
  { label: 'Pessoas', icon: Users, children: [NAV.members, NAV.invites, NAV.checkins] },
  { label: 'Dinheiro', icon: HandCoins, children: [NAV.finance, NAV.receipts, NAV.adminCharges] },
  { label: 'Agenda e avisos', icon: CalendarDays, children: [NAV.calendar, NAV.notices, NAV.notify] },
  { label: 'Arrecadação', icon: HandHeart, children: [NAV.campaigns, NAV.raffles, NAV.store, NAV.canteen] },
  { label: 'A casa', icon: Landmark, children: [NAV.site, NAV.pix, NAV.billing] },
]

const memberNavItems: NavEntry[] = [
  { label: 'Início', href: ROUTES.MEMBER_HOME, icon: Home },
  { label: 'Mural de avisos', href: ROUTES.MEMBER_NOTICES, icon: Megaphone },
  { label: 'Calendário', href: ROUTES.MEMBER_CALENDAR, icon: CalendarDays },
  MY_DEBTS,
  { label: 'Acertos e reembolsos', href: ROUTES.MEMBER_CHARGES, icon: ArrowLeftRight },
  {
    label: 'Contribuir',
    icon: HandHeart,
    children: [
      { label: 'Listas e campanhas', href: ROUTES.MEMBER_CAMPAIGNS, icon: List },
      { label: 'Rifas', href: ROUTES.MEMBER_RAFFLES, icon: Ticket },
      { label: 'Loja', href: ROUTES.MEMBER_LOJA, icon: ShoppingBag },
      { label: 'Cantina', href: ROUTES.MEMBER_STORE, icon: UtensilsCrossed },
    ],
  },
  {
    label: 'Anotações',
    icon: NotebookPen,
    children: [
      { label: 'Lista de compras', href: ROUTES.MEMBER_SHOPPING, icon: ShoppingCart },
      { label: 'Notas', href: ROUTES.MEMBER_NOTES, icon: StickyNote },
    ],
  },
]

// Admin pages accessible to members with specific permissions (seção "Gestão da casa")
const permissionNavItems: NavItem[] = [
  { ...NAV.finance, permission: 'canManageCashier' },
  { ...NAV.receipts, permission: 'canManageCashier' },
  { ...NAV.members, permission: 'canManageMembers' },
  { ...NAV.notices, permission: 'canManageMembers' },
  { ...NAV.calendar, permission: 'canManageCalendar' },
  { ...NAV.campaigns, permission: 'canManageCampaigns' },
  { ...NAV.raffles, permission: 'canManageRaffles' },
  { ...NAV.store, permission: 'canRegisterSales' },
  { ...NAV.canteen, permission: 'canRegisterSales' },
]

function CountBadge({ count }: { count: number }) {
  return (
    <span
      className="ml-auto rounded-full bg-amber-700 px-1.5 py-0.5 text-[0.6875rem] font-semibold leading-none text-white tabular-nums"
      aria-label={`${count} para conferir`}
      data-testid="nav-receipts-count"
    >
      {count}
    </span>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { profile, currentHouse } = useAuthStore()
  const logout = useLogout()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  // Contador do menu "Comprovantes" (só busca para quem cuida do caixa).
  const pendingReceipts = usePendingReceiptsCount().data ?? 0

  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const isAdmin = currentHouse?.role === 'admin'
  const extraPerms = currentHouse?.extraPermissions ?? []
  const canRegisterSales = isAdmin || extraPerms.includes('canRegisterSales' as never)
  // memberExtraNav holds the "Gestão da casa" links shown under the main nav.
  // For canRegisterSales we don't duplicate Loja/Cantina here — the main "Contribuir" submenu
  // already points to the admin/manage view (see filteredMemberNavItems below).
  const memberExtraNav = !isAdmin
    ? permissionNavItems.filter((item) =>
        item.permission
        && extraPerms.includes(item.permission as never)
        && item.href !== ROUTES.ADMIN_STORE
        && item.href !== ROUTES.ADMIN_CANTEEN,
      )
    : []
  // For members with canRegisterSales: Contribuir > Cantina/Loja point to /admin/* (manage view).
  // For members without: hide Cantina entirely (Loja stays as a buyer page).
  const filteredMemberNavItems: NavEntry[] = memberNavItems.map((entry) => {
    if (isNavGroup(entry) && entry.label === 'Contribuir') {
      const children = entry.children
        .filter((c) => c.href !== ROUTES.MEMBER_STORE || canRegisterSales)
        .map((c) => {
          if (!canRegisterSales) return c
          if (c.href === ROUTES.MEMBER_LOJA) return { ...c, href: ROUTES.ADMIN_STORE }
          if (c.href === ROUTES.MEMBER_STORE) return { ...c, href: ROUTES.ADMIN_CANTEEN }
          return c
        })
      return { ...entry, children }
    }
    return entry
  })
  const navItems: NavEntry[] = isAdmin ? adminNavItems : filteredMemberNavItems

  // Grupo com a rota atual fica aberto; os demais seguem o clique do usuário
  const isGroupExpanded = (group: NavGroup) =>
    expandedGroups.includes(group.label) ||
    group.children.some((child) => pathname.startsWith(child.href))
  const roleLabel = currentHouse?.role ? ROLE_LABELS[currentHouse.role] ?? currentHouse.role : ''

  const handleLogout = () => {
    if (logout.isPending) return
    logout.mutate()
  }

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

  // Contador ao lado do item (hoje só Comprovantes PIX: quantos esperam conferência).
  const countFor = (href: string) => (href === ROUTES.ADMIN_RECEIPTS ? pendingReceipts : 0)

  const NavLink = ({ item, mobile = false }: { item: NavItem; mobile?: boolean }) => {
    const active = isActiveRoute(item.href)
    const count = countFor(item.href)
    return (
      <Link
        href={item.href}
        // Fecha o menu mobile ao navegar
        onClick={() => setMobileMenuOpen(false)}
        className={cn(
          'group flex items-center gap-3 rounded-lg px-3 text-[0.8125rem] font-medium transition-all duration-150',
          mobile ? 'justify-between py-2.5' : 'py-2',
          active
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        <span className="flex items-center gap-3 whitespace-nowrap">
          <item.icon className={cn('size-[18px] shrink-0', active && 'text-primary')} />
          {item.label}
        </span>
        {count > 0 && <CountBadge count={count} />}
        {mobile && <ChevronRight className="size-4 opacity-30" />}
      </Link>
    )
  }

  const NavGroupToggle = ({ group, mobile = false }: { group: NavGroup; mobile?: boolean }) => {
    const isExpanded = isGroupExpanded(group)
    const hasActiveChild = group.children.some((child) => isActiveRoute(child.href))
    // Grupo fechado ainda mostra o contador dos itens dele (ex.: Dinheiro > Comprovantes PIX).
    const hiddenCount = isExpanded ? 0 : group.children.reduce((sum, child) => sum + countFor(child.href), 0)

    return (
      <div>
        <button
          type="button"
          onClick={() => toggleGroup(group.label)}
          aria-expanded={isExpanded}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 text-[0.8125rem] font-medium transition-all duration-150',
            mobile ? 'py-2.5' : 'py-2',
            hasActiveChild
              ? 'text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          <span className="flex flex-1 items-center gap-3 text-left">
            <group.icon className={cn('size-[18px] shrink-0', hasActiveChild && 'text-primary')} />
            {group.label}
          </span>
          {hiddenCount > 0 && <CountBadge count={hiddenCount} />}
          <ChevronDown
            className={cn(
              'size-4 shrink-0 transition-transform duration-200',
              isExpanded && 'rotate-180',
              hasActiveChild ? 'text-primary/50' : 'opacity-40',
            )}
          />
        </button>
        {isExpanded && (
          <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-border/50 pl-1.5">
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
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
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
          <span className="flex-1 truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
            {APP_NAME}
          </span>
          <NotificationBell className="-mr-1.5 text-sidebar-foreground/70" />
        </div>

        <Separator />

        <HouseSwitcher className="pt-2.5" />

        {/* Navigation */}
        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
          {navItems.map((entry) => renderNavEntry(entry))}
          {memberExtraNav.length > 0 && (
            <>
              <Separator className="my-2" />
              <span className="mb-1 px-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                Gestão da casa
              </span>
              {memberExtraNav.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </>
          )}
        </nav>

        {/* Sidebar Footer - User info */}
        <div className="border-t border-sidebar-border p-2.5">
          {/* A Liderança também deve à casa: fica junto da conta, fora do menu de gestão */}
          {isAdmin && renderNavEntry(MY_DEBTS)}
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
            <Link
              href={ROUTES.PROFILE}
              aria-label="Minha conta"
              title="Minha conta"
              className="inline-flex size-7 items-center justify-center rounded-md text-sidebar-foreground/40 hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/20"
            >
              <UserCog className="size-4" aria-hidden />
            </Link>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleLogout}
              disabled={logout.isPending}
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

              <HouseSwitcher className="pt-2.5" />

              {/* Mobile Nav Items */}
              <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-2.5">
                {navItems.map((entry) => renderNavEntry(entry, true))}
                {memberExtraNav.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <span className="mb-1 px-3 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground/50">
                      Gestão da casa
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
                {isAdmin && (
                  <Link
                    href={MY_DEBTS.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'mt-1 flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-muted',
                      isActiveRoute(MY_DEBTS.href) && 'bg-primary/10 text-primary',
                    )}
                  >
                    <Wallet className="size-4" aria-hidden />
                    {MY_DEBTS.label}
                  </Link>
                )}
                <Link
                  href={ROUTES.PROFILE}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-1 flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-muted"
                >
                  <UserCog className="size-4" aria-hidden />
                  Minha conta
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="mt-1 w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <LogOut className="size-4" />
                  Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <span className="text-sm font-semibold tracking-tight text-foreground">{APP_NAME}</span>

          <div className="flex items-center gap-1">
          <NotificationBell />
          <Avatar size="default">
            {profile?.photoUrl && <AvatarImage src={profile.photoUrl} alt={profile?.fullName} />}
            <AvatarFallback>
              {profile?.fullName ? getInitials(profile.fullName) : '?'}
            </AvatarFallback>
          </Avatar>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {isAdmin && <BillingAlerts />}
          {children}
        </main>
      </div>
    </div>
  )
}
