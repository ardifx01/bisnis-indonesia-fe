# Frontend - IT Programmer

## Overview

Modern React-based frontend untuk aplikasi membership dengan arsitektur yang berfokus pada user experience, performa, dan maintainability. Dibangun dengan Next.js, TypeScript, dan Material-UI untuk memberikan pengalaman pengguna yang responsif dan intuitive.

## Tech Stack

### Core Framework

- **Next.js 14**: React framework dengan App Router, SSR, dan routing
- **React 18**: UI library dengan hooks & concurrent features
- **TypeScript**: Type safety untuk better development experience

### UI & Styling

- **Material-UI (MUI)**: Comprehensive React UI framework
- **Tailwind CSS**: Utility-first CSS framework untuk custom styling
- **Lucide React**: Modern icon library untuk UI elements

### State Management & Data Fetching

- **Redux Toolkit**: Modern Redux dengan simplified API
- **Axios**: HTTP client untuk API communication
- **use-debounce**: Input debouncing untuk search optimization

### Form & Validation

- **Formik**: Powerful form library untuk complex forms
- **Yup**: Schema validation untuk form inputs
- **TinyMCE**: Rich text editor untuk content creation

### Charts & Visualization

- **Chart.js + React-ChartJS-2**: Data visualization untuk dashboard
- **Recharts**: Declarative charts untuk React

### Utilities & UX

- **SweetAlert2**: Elegant popup alerts & confirmations
- **Moment.js**: Date manipulation & formatting
- **React Loading Skeleton**: Loading states untuk better UX

## Features

- 🎨 Modern, responsive design dengan Material-UI
- 🔐 Authentication (Manual + OAuth Google/Facebook)
- 👥 Role-based UI dengan conditional rendering
- 💳 Membership management dengan upgrade/downgrade
- 📝 Rich text editor untuk artikel
- 🎥 Video player dengan analytics
- 🔍 Advanced search & filtering
- 📱 Mobile-first responsive design
- ⚡ Performance optimized dengan lazy loading
- 🌐 SEO optimized dengan Next.js SSR
- 🎭 Loading states & error handling
- ♿ Accessibility (WCAG compliant)

## Installation & Setup

### Prerequisites

- Node.js 18+
- npm atau yarn
- Backend API running (lihat Backend README)

### 1. Clone Repository

```bash
git clone <repository-url>
cd frontend
```

### 2. Install Dependencies

```bash
npm install
# atau
yarn install
```

### 3. Environment Configuration

```env
NEXT_PUBLIC_APP_IDNEXT_PUBLIC_APP_URL_API=http://localhost:5000/api/
NEXT_PUBLIC_APP_ID=123
```

### 4. Menjalankan Aplikasi

```bash
# Development mode
npm run dev
# atau
yarn dev

# Production build
npm run build
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth group routes
│   ├── (dashboard)/       # Dashboard group routes
│   ├── articles/          # Article pages
│   ├── videos/            # Video pages
│   ├── profile/           # Profile pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── api.ts            # API client configuration
│   ├── auth.ts           # Authentication utilities
│   ├── utils.ts          # General utilities
│   └── validators.ts     # Form validation schemas
├── store/                # Redux store
│   ├── slices/           # Redux slices
│   ├── middleware/       # Custom middleware
│   └── store.ts          # Store configuration
├── types/                # TypeScript type definitions
└── styles/               # Additional styles
```

## Arsitektur & Keputusan Teknis

### 1. Next.js App Router vs Pages Router

**Keputusan**: App Router (Next.js)
**Alasan**:

- Modern routing dengan nested layouts
- Better TypeScript integration
- Server Components untuk improved performance
- Streaming dan Suspense support
- Future-proof architecture

### 2. State Management: Redux vs Context

**Keputusan**: Redux Toolkit
**Alasan**:

- Complex state dengan banyak entities (users, articles, videos)
- DevTools untuk debugging
- Middleware support untuk side effects
- Time travel debugging
- Predictable state updates

### 3. UI Library: Material-UI vs Custom Components

**Keputusan**: Material-UI + Tailwind CSS hybrid
**Alasan**:

- Rapid development dengan pre-built components
- Accessibility built-in
- Theming system untuk consistency
- Tailwind untuk custom styling needs
- Professional look dengan minimal effort

### 4. Form Handling: Formik vs React Hook Form

**Keputusan**: Formik + Yup
**Alasan**:

- Complex forms dengan nested fields
- Schema-based validation
- Better integration dengan existing codebase
- Mature ecosystem
- Good TypeScript support

### 5. Data Fetching Strategy

**Keputusan**: Axios dengan Redux Thunk
**Alasan**:

- Consistent API interface
- Request/response interceptors
- Error handling centralization
- Loading state management
- Caching capabilities

## Waktu Pengembangan & Trade-offs

### Estimasi Waktu (12 jam total)

Strategi MVP:

4 jam: Setup Next.js + TypeScript + MUI + auth pages
6 jam: Dashboard, article pages, video pages, profile basic
1.5 jam: Redux basic + API integration
0.5 jam: Responsive fixes

Trade-offs utama:

Skip Tailwind CSS integration
No rich text editor (pakai textarea)
Forms native tanpa Formik/Yup
No charts/analytics UI
Loading states minimal
No advanced UX features

Hasil MVP dalam 12 jam:

✅ Authentication system working
✅ CRUD operations untuk articles & videos
✅ Basic membership system
✅ Responsive UI dengan Material-UI
✅ Functional dashboard

### Trade-offs Decisions

#### 1. SSR vs CSR vs Static Generation

**Keputusan**: Hybrid approach (SSR untuk content, CSR untuk dashboard)
**Trade-off**:

- ✅ SEO benefits, fast initial load
- ❌ Complex caching, server requirements
- **Mitigasi**: Strategic use per page type

#### 2. Real-time Updates vs Polling

**Keputusan**: HTTP polling untuk updates
**Trade-off**:

- ✅ Simpler implementation, reliable
- ❌ Not truly real-time, bandwidth usage
- **Mitigasi**: WebSocket upgrade planned for v2

#### 3. Component Library vs Custom Design

**Keputusan**: Material-UI dengan customization
**Trade-off**:

- ✅ Fast development, consistency, accessibility
- ❌ Bundle size, design limitations
- **Mitigasi**: Tree shaking, custom theme

#### 4. Client-side Routing vs Full Page Reloads

**Keputusan**: Next.js App Router dengan client navigation
**Trade-off**:

- ✅ Better UX, faster navigation
- ❌ Complex state management
- **Mitigasi**: Proper loading states, error boundaries
