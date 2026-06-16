# Toolbar Component Documentation

The Toolbar component provides a flexible and reusable interface for common page actions like search, filtering, sorting, and custom actions. It's designed specifically for the Swasthya Punjab healthcare application.

## Installation

The toolbar components are located in `src/components/ui/toolbar.tsx` and use existing UI components from your project.

## Components

### Toolbar (Root Component)

The main container for all toolbar functionality.

```tsx
<Toolbar title="Optional Title" description="Optional description">
  {/* Toolbar content */}
</Toolbar>
```

**Props:**
- `title?: string` - Optional title displayed above the toolbar
- `description?: string` - Optional description text
- Standard HTML div props

### ToolbarSearch

Provides a search input with integrated search icon.

```tsx
<ToolbarSearch
  searchValue={search}
  onSearchChange={setSearch}
  placeholder="Search patients..."
/>
```

**Props:**
- `searchValue?: string` - Current search value
- `onSearchChange?: (value: string) => void` - Search change handler
- Standard HTML input props

### ToolbarActions

Container for grouping action buttons and controls.

```tsx
<ToolbarActions>
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</ToolbarActions>
```

### ToolbarSort

Dropdown for sorting options with visual indicators.

```tsx
<ToolbarSort
  sortOptions={[
    { key: 'name', label: 'Name' },
    { key: 'date', label: 'Date' },
  ]}
  currentSort={sortKey}
  sortDirection={sortDirection}
  onSortChange={handleSortChange}
/>
```

**Props:**
- `sortOptions: Array<{key: string, label: string}>` - Available sort options
- `currentSort?: string` - Currently selected sort key
- `sortDirection?: 'asc' | 'desc'` - Current sort direction
- `onSortChange?: (key: string, direction: 'asc' | 'desc') => void` - Sort change handler

### ToolbarFilter

Filter dropdown with active filter badges.

```tsx
<ToolbarFilter
  filters={[
    { key: 'active', label: 'Active', active: true },
    { key: 'inactive', label: 'Inactive', active: false },
  ]}
  onFilterChange={handleFilterChange}
/>
```

**Props:**
- `filters: Array<{key: string, label: string, active?: boolean}>` - Filter options
- `onFilterChange?: (key: string, active: boolean) => void` - Filter change handler

### ToolbarMoreActions

Dropdown menu for additional actions.

```tsx
<ToolbarMoreActions
  actions={[
    {
      key: 'export',
      label: 'Export Data',
      icon: <Download className="h-4 w-4" />,
      onClick: () => handleExport(),
    },
    {
      key: 'import',
      label: 'Import Data',
      icon: <Upload className="h-4 w-4" />,
      onClick: () => handleImport(),
      disabled: true,
    },
  ]}
/>
```

**Props:**
- `actions: Array<{key: string, label: string, icon?: ReactNode, onClick?: () => void, disabled?: boolean}>` - Action items

## Complete Example

Here's a complete example showing how to use all toolbar components together:

```tsx
"use client";

import { useState, useMemo } from 'react';
import {
  Toolbar,
  ToolbarSearch,
  ToolbarActions,
  ToolbarSort,
  ToolbarFilter,
  ToolbarMoreActions,
} from '@/components/ui/toolbar';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Upload } from 'lucide-react';

export default function ExamplePage() {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState([
    { key: 'active', label: 'Active', active: false },
    { key: 'recent', label: 'Recent', active: false },
  ]);

  const handleSortChange = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleFilterChange = (key: string, active: boolean) => {
    setFilters(prev => prev.map(f => f.key === key ? { ...f, active } : f));
  };

  return (
    <div>
      <Toolbar 
        title="Data Management" 
        description="Manage and organize your data efficiently"
      >
        <ToolbarSearch
          searchValue={search}
          onSearchChange={setSearch}
          placeholder="Search records..."
        />
        <ToolbarActions>
          <ToolbarFilter
            filters={filters}
            onFilterChange={handleFilterChange}
          />
          <ToolbarSort
            sortOptions={[
              { key: 'name', label: 'Name' },
              { key: 'date', label: 'Date' },
              { key: 'status', label: 'Status' },
            ]}
            currentSort={sortKey}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />
          <ToolbarMoreActions
            actions={[
              {
                key: 'export',
                label: 'Export Data',
                icon: <Download className="h-4 w-4" />,
                onClick: () => console.log('Export'),
              },
              {
                key: 'import',
                label: 'Import Data',
                icon: <Upload className="h-4 w-4" />,
                onClick: () => console.log('Import'),
              },
            ]}
          />
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </ToolbarActions>
      </Toolbar>
      
      {/* Your page content here */}
    </div>
  );
}
```

## Healthcare Application Examples

### Patient Management
```tsx
<Toolbar>
  <ToolbarSearch placeholder="Search patients..." />
  <ToolbarActions>
    <ToolbarFilter
      filters={[
        { key: 'male', label: 'Male' },
        { key: 'female', label: 'Female' },
        { key: 'critical', label: 'Critical' },
      ]}
    />
    <ToolbarSort
      sortOptions={[
        { key: 'name', label: 'Name' },
        { key: 'age', label: 'Age' },
        { key: 'lastVisit', label: 'Last Visit' },
      ]}
    />
    <Button>Add Patient</Button>
  </ToolbarActions>
</Toolbar>
```

### Prescription Management
```tsx
<Toolbar>
  <ToolbarSearch placeholder="Search prescriptions..." />
  <ToolbarActions>
    <ToolbarFilter
      filters={[
        { key: 'pending', label: 'Pending' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'expired', label: 'Expired' },
      ]}
    />
    <ToolbarMoreActions
      actions={[
        { key: 'print', label: 'Print All' },
        { key: 'export', label: 'Export to PDF' },
      ]}
    />
    <Button>New Prescription</Button>
  </ToolbarActions>
</Toolbar>
```

## Styling

The toolbar uses Tailwind CSS classes and follows the design system established in your application. It includes:

- Responsive design (mobile-first)
- Proper spacing and alignment
- Consistent typography
- Accessible color contrast
- Backdrop blur effects
- Smooth animations

## Best Practices

1. **Keep it Simple**: Don't overcrowd the toolbar with too many actions
2. **Logical Grouping**: Group related actions together using ToolbarActions
3. **Progressive Enhancement**: Show basic actions prominently, hide advanced ones in MoreActions
4. **Responsive Design**: The toolbar automatically adapts to mobile screens
5. **Accessibility**: All components include proper ARIA labels and keyboard navigation

## Integration with Existing Pages

The toolbar can be easily integrated into existing pages by replacing existing search/filter implementations. See the updated patients page for a complete example.