"use client"

import * as React from "react"
import { Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SimpleToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  searchValue?: string
  searchPlaceholder?: string
  onSearchChange?: (value: string) => void
  primaryAction?: {
    label: string
    onClick?: () => void
    href?: string
  }
  children?: React.ReactNode
}

const SimpleToolbar = React.forwardRef<HTMLDivElement, SimpleToolbarProps>(
  ({ 
    className, 
    title, 
    searchValue, 
    searchPlaceholder = "Search...", 
    onSearchChange,
    primaryAction,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border-b bg-background/50",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-4 flex-1">
          {title && (
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          )}
          
          {onSearchChange && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-10"
              />
            </div>
          )}
          
          {children}
        </div>

        {primaryAction && (
          <Button onClick={primaryAction.onClick}>
            <Plus className="mr-2 h-4 w-4" />
            {primaryAction.label}
          </Button>
        )}
      </div>
    )
  }
)
SimpleToolbar.displayName = "SimpleToolbar"

export { SimpleToolbar }