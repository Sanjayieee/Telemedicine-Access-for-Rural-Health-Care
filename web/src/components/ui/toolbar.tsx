"use client"

import * as React from "react"
import { Search, Filter, SortAsc, SortDesc, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

interface ToolbarSearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  searchValue?: string
  onSearchChange?: (value: string) => void
}

interface ToolbarActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

interface ToolbarSortProps {
  sortOptions: Array<{
    key: string
    label: string
  }>
  currentSort?: string
  sortDirection?: 'asc' | 'desc'
  onSortChange?: (key: string, direction: 'asc' | 'desc') => void
}

interface ToolbarFilterProps {
  filters: Array<{
    key: string
    label: string
    active?: boolean
  }>
  onFilterChange?: (key: string, active: boolean) => void
}

interface ToolbarMoreActionsProps {
  actions: Array<{
    key: string
    label: string
    icon?: React.ReactNode
    onClick?: () => void
    disabled?: boolean
  }>
}

const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col gap-4 p-4 border-b bg-background/50 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {children}
        </div>
      </div>
    )
  }
)
Toolbar.displayName = "Toolbar"

const ToolbarSearch = React.forwardRef<HTMLInputElement, ToolbarSearchProps>(
  ({ className, searchValue, onSearchChange, placeholder = "Search...", ...props }, ref) => {
    return (
      <div className="relative flex-grow max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={ref}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={placeholder}
          className={cn("pl-10", className)}
          {...props}
        />
      </div>
    )
  }
)
ToolbarSearch.displayName = "ToolbarSearch"

const ToolbarActions = React.forwardRef<HTMLDivElement, ToolbarActionsProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-2", className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ToolbarActions.displayName = "ToolbarActions"

const ToolbarSort = React.forwardRef<HTMLDivElement, ToolbarSortProps>(
  ({ sortOptions, currentSort, sortDirection, onSortChange, ...props }, ref) => {
    const currentOption = sortOptions.find(option => option.key === currentSort)
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            {sortDirection === 'desc' ? (
              <SortDesc className="mr-2 h-4 w-4" />
            ) : (
              <SortAsc className="mr-2 h-4 w-4" />
            )}
            {currentOption?.label || 'Sort'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {sortOptions.map((option) => (
            <React.Fragment key={option.key}>
              <DropdownMenuItem 
                onClick={() => onSortChange?.(option.key, 'asc')}
                className={cn(
                  currentSort === option.key && sortDirection === 'asc' && "bg-accent"
                )}
              >
                <SortAsc className="mr-2 h-4 w-4" />
                {option.label} (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onSortChange?.(option.key, 'desc')}
                className={cn(
                  currentSort === option.key && sortDirection === 'desc' && "bg-accent"
                )}
              >
                <SortDesc className="mr-2 h-4 w-4" />
                {option.label} (Z-A)
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)
ToolbarSort.displayName = "ToolbarSort"

const ToolbarFilter = React.forwardRef<HTMLDivElement, ToolbarFilterProps>(
  ({ filters, onFilterChange, ...props }, ref) => {
    const activeFilters = filters.filter(f => f.active)
    
    return (
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="mr-2 h-4 w-4" />
              Filter
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {filters.map((filter) => (
              <DropdownMenuItem
                key={filter.key}
                onClick={() => onFilterChange?.(filter.key, !filter.active)}
                className="flex items-center justify-between"
              >
                <span>{filter.label}</span>
                {filter.active && (
                  <div className="h-2 w-2 rounded-full bg-primary"></div>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {activeFilters.map((filter) => (
              <Badge
                key={filter.key}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onFilterChange?.(filter.key, false)}
              >
                {filter.label} ×
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }
)
ToolbarFilter.displayName = "ToolbarFilter"

const ToolbarMoreActions = React.forwardRef<HTMLDivElement, ToolbarMoreActionsProps>(
  ({ actions, ...props }, ref) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((action, index) => (
            <DropdownMenuItem
              key={action.key}
              onClick={action.onClick}
              disabled={action.disabled}
              className="flex items-center"
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
)
ToolbarMoreActions.displayName = "ToolbarMoreActions"

export {
  Toolbar,
  ToolbarSearch,
  ToolbarActions,
  ToolbarSort,
  ToolbarFilter,
  ToolbarMoreActions,
}