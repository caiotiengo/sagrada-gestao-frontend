'use client'

import * as React from 'react'
import { Phone } from 'lucide-react'

import type { MemberItem } from '@/types'
import { getInitials, formatPhone } from '@/utils'
import { ROLE_LABELS } from '@/constants'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface MemberListItemProps {
  member: MemberItem
  onClick?: (member: MemberItem) => void
  action?: React.ReactNode
}

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  filho_de_santo: 'outline',
}

export function MemberListItem({ member, onClick, action }: MemberListItemProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => onClick?.(member)}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick(member)
        }
      }}
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 shadow-sm transition-all duration-150 sm:p-4',
        onClick && 'cursor-pointer hover:bg-muted/40'
      )}
    >
      <Avatar size="lg">
        {member.photoUrl && <AvatarImage src={member.photoUrl} alt={member.fullName} />}
        <AvatarFallback>{getInitials(member.fullName)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{member.fullName}</p>
          <Badge variant={roleBadgeVariant[member.role] ?? 'outline'} className="shrink-0">
            {ROLE_LABELS[member.role] ?? member.role}
          </Badge>
        </div>

        {member.phone && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="size-3" />
            <span>{formatPhone(member.phone)}</span>
          </div>
        )}
      </div>

      {action && (
        <div className="shrink-0">{action}</div>
      )}
    </div>
  )
}
