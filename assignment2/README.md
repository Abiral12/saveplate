This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


saveplate/
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│   ├── images/
│   └── icons/
│
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── verify-email/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (protected)/
│   │   │   ├── layout.tsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── inventory/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── donations/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   └── settings/
│   │   │       └── privacy/
│   │   │           └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── verify-email/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── resend-code/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── login/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── logout/
│   │   │   │   │   └── route.ts
│   │   │   │   └── me/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── inventory/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── mark-used/
│   │   │   │       │   └── route.ts
│   │   │   │       ├── donate/
│   │   │   │       │   └── route.ts
│   │   │   │       └── images/
│   │   │   │           └── route.ts
│   │   │   │
│   │   │   ├── donations/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   └── settings/
│   │   │       └── privacy/
│   │   │           └── route.ts
│   │   │
│   │   ├── error.tsx
│   │   ├── not-found.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── badge.tsx
│   │   │   └── spinner.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── page-header.tsx
│   │   │
│   │   └── shared/
│   │       ├── empty-state.tsx
│   │       ├── form-error.tsx
│   │       └── confirm-dialog.tsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── login-form.tsx
│   │   │   │   ├── register-form.tsx
│   │   │   │   └── verification-form.tsx
│   │   │   ├── auth.schema.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.types.ts
│   │   │
│   │   ├── inventory/
│   │   │   ├── components/
│   │   │   │   ├── food-item-form.tsx
│   │   │   │   ├── food-item-card.tsx
│   │   │   │   ├── inventory-list.tsx
│   │   │   │   └── image-uploader.tsx
│   │   │   ├── inventory.schema.ts
│   │   │   ├── inventory.service.ts
│   │   │   └── inventory.types.ts
│   │   │
│   │   ├── donations/
│   │   │   ├── components/
│   │   │   │   ├── donation-card.tsx
│   │   │   │   ├── donation-list.tsx
│   │   │   │   ├── donation-filters.tsx
│   │   │   │   └── donation-form.tsx
│   │   │   ├── donation.schema.ts
│   │   │   ├── donation.service.ts
│   │   │   └── donation.types.ts
│   │   │
│   │   └── settings/
│   │       ├── components/
│   │       │   └── privacy-form.tsx
│   │       ├── settings.schema.ts
│   │       └── settings.service.ts
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   └── prisma.ts
│   │   │
│   │   ├── supabase/
│   │   │   ├── storage-client.ts
│   │   │   └── storage.service.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── current-user.ts
│   │   │   ├── require-user.ts
│   │   │   └── session-cookie.ts
│   │   │
│   │   ├── security/
│   │   │   ├── password.ts
│   │   │   └── token.ts
│   │   │
│   │   ├── http/
│   │   │   ├── api-response.ts
│   │   │   └── api-error.ts
│   │   │
│   │   ├── email/
│   │   │   └── email.service.ts
│   │   │
│   │   ├── env.ts
│   │   └── utils.ts
│   │
│   └── types/
│       ├── api.ts
│       └── pagination.ts
│
├── tests/
│   ├── unit/
│   │   ├── auth/
│   │   ├── inventory/
│   │   └── donations/
│   │
│   ├── integration/
│   │   ├── auth/
│   │   ├── inventory/
│   │   └── donations/
│   │
│   └── e2e/
│       ├── auth.spec.ts
│       ├── inventory.spec.ts
│       └── donations.spec.ts
│
├── .env.example
├── .env.local
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── playwright.config.ts
├── prisma.config.ts
├── tsconfig.json
└── vitest.config.ts