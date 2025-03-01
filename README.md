# Next.js Authentication Project

A comprehensive Next.js application implementing a complete authentication system with email verification, password management, and protected routes using modern web technologies.

## Technology Stack

- **Next.js 14**: React framework with App Router architecture
- **TypeScript**: For type safety and better developer experience
- **NextAuth.js**: Authentication framework with multiple providers
- **Zustand**: Lightweight state management solution
- **Prisma**: Type-safe ORM for database operations
- **PostgreSQL**: Relational database for user data
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/UI**: High-quality, accessible UI components
- **Resend**: Email delivery service for verification
- **React Email**: React components for email templates
- **Docker**: Containerization for development and deployment

## Features

- **Multi-provider Authentication**
  - Email/password authentication with secure storage
  - Google OAuth integration
  - Expandable to other OAuth providers

- **Email Verification**
  - OTP (One-Time Password) verification system
  - Email templates for verification and welcome emails
  - Resend integration for reliable email delivery

- **User Profile Management**
  - Update personal information (name, username, email)
  - Profile image upload and management
  - Support for Google profile images with cross-origin handling
  - Seamless OAuth profile data integration

- **User Experience**
  - Real-time form validation with detailed feedback
  - Password strength requirements (8+ chars, uppercase, number)
  - Password visibility toggle
  - Responsive design for all device sizes

- **Security**
  - Protected routes with middleware
  - Email verification enforcement
  - Secure password hashing with bcrypt
  - JWTs with custom claims
  - Proper handling of third-party authentication provider data

- **State Management**
  - Centralized auth state with Zustand
  - Profile management with dedicated store
  - Clean separation of UI and business logic
  - Persistent sessions with NextAuth
  
- **Code Quality**
  - TypeScript for type safety
  - Component-based architecture
  - Consistent code style and organization

## Requirements

- Node.js 18 or higher
- Docker and Docker Compose
- npm, yarn, or pnpm

## Setup & Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd example-login-nextjs
```

### 2. Install dependencies

```bash
# Using npm
npm install

# Using Yarn
yarn install

# Using pnpm (recommended)
pnpm install
```

### 3. Environment variables

Create a `.env` file with the following variables:

```
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb?schema=public"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=your-email@example.com
FROM_NAME=Your App Name
```

### 4. Start the database

```bash
docker-compose up -d
```

### 5. Run Prisma migrations

```bash
npx prisma migrate dev
```

### 6. Start the development server

```bash
# Using npm
npm run dev

# Using Yarn
yarn dev

# Using pnpm
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # Auth API endpoints
│   │   │   └── ...          # Other API endpoints
│   │   ├── auth/            # Auth pages (login, register)
│   │   ├── verify/          # Email verification
│   │   ├── profile/         # User profile management
│   │   ├── dashboard/       # Protected user area
│   │   └── ...
│   ├── components/          # React components
│   │   ├── emails/          # Email templates
│   │   ├── profile/         # Profile management components
│   │   └── ui/              # UI components
│   ├── lib/                 # Utility functions
│   │   ├── email.ts         # Email sending utilities
│   │   └── db.ts            # Database client
│   ├── middleware.ts        # NextAuth middleware
│   └── stores/              # Zustand stores
│       ├── useAuthStore.ts  # Authentication state
│       └── useProfileStore.ts # Profile management state
├── .env                     # Environment variables
└── ...                      # Config files
```

## Development Guidelines

### State Management with Zustand

- Use the `useAuthStore` for all authentication-related state
- Use the `useProfileStore` for profile management state
- Maintain a single source of truth for auth and profile state
- Keep store actions pure and separate from UI components

```typescript
// Example usage in components
const { loginWithCredentials, isLoading, error } = useAuthStore();
const { updateProfile, updateProfileImage } = useProfileStore();
```

### UI Components

- Use Shadcn/UI components when available
- Follow Tailwind's utility-first approach
- Maintain mobile responsiveness
- Keep accessibility in mind (proper ARIA attributes, keyboard navigation)

### Form Validation

- Use React Hook Form for form management
- Implement client-side validation with detailed error messages
- Show validation in real-time using `mode: "onChange"`
- Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one number

### API Routes

- Implement proper error handling and status codes
- Validate all input data on the server side
- Use Prisma transactions when making multiple related updates

### Authentication Flow

1. User registers with email/password
2. Verification email sent with OTP code
3. User verifies email with OTP
4. Welcome email sent upon verification
5. User can now access protected routes

### Profile Image Handling

- Supports both uploaded images and OAuth provider images
- Proper handling of Google profile images with `referrerPolicy="no-referrer"`
- Cache-busting for local images to ensure fresh content
- Graceful fallback to initials when no image is available

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Write/update tests if applicable
4. Submit a pull request
5. Get code review and approval

## License

[MIT](LICENSE)
