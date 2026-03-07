# Gigs Mtaani

A secure, hyperlocal gig platform designed specifically for university students. Find and offer services within your campus community with enhanced security features and modern UI/UX.

## 🚀 Features

### Security & Safety
- **End-to-End Encrypted Chat**: Secure communication between users
- **Multi-Factor Authentication**: Enhanced login security
- **Risk Assessment System**: AI-powered risk scoring for user safety
- **Safety Monitoring**: Real-time location tracking and emergency SOS
- **Identity Verification**: Campus email verification system

### Core Functionality
- **Hyperlocal Gig Discovery**: Find gigs within your campus radius
- **Secure Payments**: Escrow-based payment system
- **Real-time Chat**: WebSocket-based messaging with encryption
- **User Profiles**: Verified student profiles with ratings
- **Transaction History**: Complete financial tracking

### Modern Tech Stack
- **Frontend**: React 19 + Vite + TypeScript
- **Backend**: Fastify + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with refresh tokens
- **Real-time**: WebSocket communication
- **Security**: Argon2 password hashing, rate limiting

## 🏗️ Project Structure

```
gigs-mtaani/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # API clients and utilities
│   │   ├── state/        # Zustand stores
│   │   └── styles-modern.css
│   ├── package.json
│   └── vite.config.ts
├── backend/               # Fastify API server
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   ├── lib/          # Utilities and middleware
│   │   ├── config.ts     # Configuration
│   │   └── supabase.ts   # Database client
│   ├── package.json
│   └── tsconfig.json
├── .env                   # Environment variables
├── .env.example           # Environment template
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js >= 20.11.0
- npm >= 9.0.0

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd gigs-mtaani

# Install dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:


# Redis Configuration (for caching and rate limiting)
REDIS_URL=redis://localhost:6379
```

### 3. Database Setup

1. **Create Supabase Project**: Go to [Supabase](https://supabase.com) and create a new project
2. **Get Connection Details**: Copy your project URL and API keys
3. **Configure Environment**: Update your `.env` file with the Supabase credentials
4. **Run Migrations**: Execute database migrations (if provided)

### 4. Development

Start both frontend and backend development servers:

```bash
# Start development servers
npm run dev
```

This will start:
- Backend API server on `http://localhost:4000`
- Frontend development server on `http://localhost:3000`

### 5. Production Build

```bash
# Build both frontend and backend
npm run build

# Start production servers
cd backend && npm start
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login with MFA
- `POST /auth/refresh` - Token refresh
- `GET /auth/me` - Get current user

### Gigs
- `GET /gigs/feed` - Get gigs by location
- `POST /gigs` - Create new gig
- `POST /gigs/:id/apply` - Apply to gig
- `GET /gigs/mine/posted` - Get user's posted gigs

### Chat
- `GET /chat/threads` - Get chat threads
- `GET /chat/threads/:id/messages` - Get messages
- `POST /chat/threads/:id/messages` - Send message
- `GET /chat/prekeys/:userId` - Get prekeys for encryption

### Wallet & Payments
- `GET /escrow/wallet/me` - Get wallet balance
- `POST /escrow/wallet/topup` - Add funds

### Safety
- `GET /safety/sessions/active` - Get active safety sessions
- `POST /safety/sessions/:id/sos` - Send SOS alert

## 🎨 UI Components

The frontend features a modern, responsive design with:

- **Professional Color Scheme**: Clean blue and gray palette
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Loading States**: Skeleton loaders for better UX
- **Toast Notifications**: User feedback system
- **Form Validation**: Client-side validation with helpful messages
- **Accessibility**: ARIA labels and keyboard navigation

## 🔒 Security Features

### Authentication & Authorization
- JWT tokens with automatic refresh
- Rate limiting on authentication endpoints
- Secure password hashing with Argon2
- Multi-factor authentication support

### Data Protection
- End-to-end encrypted messaging
- Secure session management
- Input validation and sanitization
- CORS protection

### Risk Management
- User risk scoring system
- Suspicious activity detection
- Safety monitoring and alerts
- Emergency contact integration

## 🚀 Deployment

### Vercel (Frontend)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Railway/DigitalOcean (Backend)
1. Connect your repository
2. Configure environment variables
3. Set up Supabase integration
4. Deploy and monitor

### Docker (Optional)
While Docker has been removed from the default setup, you can still containerize the application:

```dockerfile
# Frontend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend as a Service
- [React](https://react.dev) - Frontend library
- [Fastify](https://fastify.io) - Backend framework
- [Zustand](https://zustand-demo.pmnd.rs) - State management
- [TanStack Query](https://tanstack.com/query) - Data fetching

## 📞 Support

For support, email support@gigsmataani.com or join our Discord server.

---

**Made with ❤️ for the student community**