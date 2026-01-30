# Admin Panel Design System

## Core Philosophy

- **Aesthetic**: Dark, Modern, Minimal (Inherited from User Panel).
- **Differentiation**: increased data density, tabular layouts, and high-contrast status indicators.
- **Glassmorphism**: Used sparingly for containers to maintain legibility of dense data.

## Color Palette (Extended)

Inherits from `src/styles.css` but introduces specific data-visualization colors.

```css
:root {
  /* Admin Specific Backgrounds - Deeper for contrast */
  --admin-bg: #05080f; /* Darker than main app */
  --admin-sidebar: #0f131f;
  --admin-header: rgba(15, 19, 31, 0.8);

  /* Data Colors */
  --color-trend-up: #10b981;
  --color-trend-down: #ef4444;
  --color-trend-neutral: #94a3b8;

  /* Tabe Row States */
  --row-hover: rgba(255, 255, 255, 0.03);
  --row-selected: rgba(74, 144, 226, 0.1);

  /* Density Spacing */
  --admin-space-xs: 0.25rem; /* 4px */
  --admin-space-sm: 0.5rem; /* 8px */
  --admin-space-md: 0.75rem; /* 12px - Tighter than user panel 16px */
}
```

## Typography Guidelines

Shift towards utility and readability for data tables.

- **Headings**: `Space Grotesk` - Bold, distinct.
- **Body/Data**: `Inter` - Highly legible at small sizes.
  - **Table Headers**: `0.75rem` (12px), Uppercase, Tracking `0.05em`, Color `text-muted`.
  - **Table Data**: `0.875rem` (14px), Color `text-primary`.
  - **KPI Values**: `1.5rem` (24px) to `2rem` (32px), `Space Grotesk`.

## layout Guidelines

### 1. Dashboard Grid (Dense)

For the admin dashboard, we use a denser grid system to show more KPIs above the fold.

```css
.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem; /* Tighter gap */
}
```

### 2. Data Tables

Tables should span full width within cards.

- **Style**: clean rows, no vertical borders.
- **Header**: Sticky top, distinct background.
- **Actions**: Right-aligned, icon-only to save space.

### 3. Sidebar (Admin Specific)

- **Width**: Compact (240px).
- **State**: Collapsible to icon-only mode (64px) for maximum data view.
- **Navigation**: High contrast active state (`border-left` accent).

## Reusable Classes (New)

```css
/* Compact Card for KPIs */
.card-metric {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Status Badges - Pill shape, soft background */
.badge-soft {
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}
.badge-soft-success {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
}
.badge-soft-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
}
.badge-soft-danger {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}
```
