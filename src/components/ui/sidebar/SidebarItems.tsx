'use client';

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

interface SidebarItemsProps {
    icon: LucideIcon;
    label: string;
    href: string;
    isCollapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemsProps> = ({
    icon: Icon,
    label,
    href,
    isCollapsed
}) => {
    const pathname = usePathname()
    const isActive = pathname === href || pathname.startsWith(href + '/')

    return (
        <Link 
            href={href} 
            className={cn(
                "flex items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                "hover:bg-gray-800 hover:text-white",
                isActive ? "bg-blue-600 text-white font-medium" : "text-gray-300",
                isCollapsed ? "justify-center" : "justify-start"
            )}
        >
            <Icon className={cn("h-5 w-5 shrink-0", isCollapsed ? "" : "mr-3")} />
            {!isCollapsed && <span className='truncate'>{label}</span>}
        </Link>
    )
}

export default SidebarItem;