# Customization Guide

This document explains how to customize the Size Charts application for your needs.

## Architecture Overview

The application has three main sections:

```
app/
├── (public)/           # Marketing & documentation site
│   ├── page.tsx        # Home/landing page
│   ├── demo/           # Widget demos
│   ├── docs/           # Documentation
│   └── size-guide/     # Customer-facing size charts ← KEEP
├── admin/              # Admin panel ← KEEP
└── api/                # All APIs ← KEEP

public/
├── demo/               # Static HTML demo
└── embed/              # Widget script ← KEEP

components/
├── admin/              # Admin components ← KEEP
├── docs/               # Documentation components
├── public/             # Public site components
└── ui/                 # Shared UI components ← KEEP
```

## Stripping the Marketing Site

If you only need the admin panel, size guide, and API (no marketing/docs site), follow these steps:

### 1. Remove marketing routes

Delete the following from `app/(public)/`:
- `page.tsx` (home page)
- `demo/` folder
- `docs/` folder

Keep:
- `layout.tsx` (or simplify it)
- `size-guide/` folder

### 2. Remove marketing assets

Delete:
- `public/demo/` folder
- `components/docs/` folder

### 3. Simplify the public layout

Edit `app/(public)/layout.tsx` to remove marketing nav items:

```tsx
// Before
const navLinks = [
  { name: "Demo", href: "/demo", icon: Code2 },
  { name: "Docs", href: "/docs", icon: FileText },
];

// After - just keep the size guide
const navLinks = [];
// Or remove nav entirely and just show logo + admin link
```

### 4. Update the root redirect

Create a simple `app/(public)/page.tsx` that redirects to your preferred location:

```tsx
import { redirect } from "next/navigation";
export default function Home() {
  redirect("/size-guide");
  // Or redirect("/admin");
}
```

## Quick Strip Script

Run this to remove marketing content:

```bash
# Remove marketing routes
rm -rf app/\(public\)/demo
rm -rf app/\(public\)/docs

# Remove marketing assets
rm -rf public/demo
rm -rf components/docs

# Update home page to redirect
cat > app/\(public\)/page.tsx << 'EOF'
import { redirect } from "next/navigation";
export default function Home() {
  redirect("/size-guide");
}
EOF
```

## What Each Section Contains

### Keep for Production Use

| Path | Purpose |
|------|---------|
| `app/(public)/size-guide/` | Customer-facing size chart browser |
| `app/admin/` | Admin panel for managing charts |
| `app/api/` | REST API endpoints |
| `public/embed/size-charts.js` | Embeddable widget |
| `components/admin/` | Admin UI components |
| `components/ui/` | Shared shadcn/ui components |

### Can Remove (Marketing/Docs)

| Path | Purpose |
|------|---------|
| `app/(public)/page.tsx` | Marketing home page |
| `app/(public)/demo/` | Widget demo pages |
| `app/(public)/docs/` | Documentation pages |
| `public/demo/` | Static HTML demo |
| `components/docs/` | Documentation components |

## GitHub Link

The GitHub link in the nav (`app/(public)/layout.tsx`) points to a placeholder URL. Update it to your repository:

```tsx
href="https://github.com/your-org/size-charts"
// Change to your repo URL
```

## Branding

To rebrand the application:

1. **Logo/Name**: Edit `app/(public)/layout.tsx` and `app/admin/layout.tsx`
2. **Colors**: Edit `app/globals.css` CSS variables
3. **Favicon**: Replace `app/favicon.ico`
