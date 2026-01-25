# Neighborly Client Setup

React Native Web app for Neighborly community platform.

## Prerequisites

- Node.js 20+
- npm or yarn

## Installation

```bash
npm install
```

## Project Structure

```
client/
├── app/                          # File-based routing (pages/screens)
│   ├── (tabs)/                   # Tab navigation group
│   │   ├── _layout.tsx           # Tabs configuration (defines bottom nav bar)
│   │   ├── index.tsx             # [PLACEHOLDER]
│   │   └── two.tsx               # [PLACEHOLDER]
│   ├── _layout.tsx               # Root layout (wraps entire app, handles fonts/theme)
│   ├── modal.tsx                 # [PLACEHOLDER]
│   ├── +not-found.tsx            # 404 page
│   └── +html.tsx                 # HTML document wrapper (web only)
│
├── components/                   # Reusable UI components
│   ├── Themed.tsx                # Theme-aware Text & View (supports dark/light mode)
│   ├── EditScreenInfo.tsx        # [PLACEHOLDER] Demo component
│   ├── ExternalLink.tsx          # Utility: handles external URLs (web vs mobile)
│   └── useColorScheme.ts         # Utility: detects system dark/light mode
│
├── constants/                    # App constants (colors, config, etc.)
├── assets/                       # Images, fonts, and other static files
├── babel.config.js               # Babel configuration (transpiler)
├── metro.config.js               # Metro configuration (packager)
├── nativewind-env.d.ts           # NativeWind configuration (generated)
├── tailwind.config.js            # TailwindCSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## Key Concepts

### File-based Routing (`app/` folder)

- Each file in `app/` automatically becomes a route
- `app/login.tsx` → accessible at `/login`
- `(tabs)` is a route group for tab navigation (bottom nav bar)
- `_layout.tsx` files configure navigation structure

### Components (`components/` folder)

- Reusable UI building blocks
- Import and use across multiple screens
- Example: `<Text>`, `<View>`, custom buttons, forms, etc.

## Getting Started

### Initial Setup

Install dependencies by:

```bash
npm install
```

> **Note**: If you encounter peer dependency warnings, use `npm install --legacy-peer-deps`

## Configuration

### Apollo Client Setup

The app connects to AWS AppSync GraphQL API. Configuration is in `lib/apollo-client.ts`.

**For development**, hardcoded values are used:

- AppSync URL: Check CDK outputs from `jiahao-AuthStack.ApiUrl`
- API Key: Check CDK outputs from `jiahao-AuthStack.ApiKey`

**For production**, use environment variables:

```bash
# Create .env file
EXPO_PUBLIC_APPSYNC_URL=your-appsync-url
EXPO_PUBLIC_API_KEY=your-api-key
```

## Run Development Server

```bash
npm start
```

Then:

- Press `w` for web
- Press `i` for iOS simulator
- Press `a` for Android emulator

## Project Structure

```
client/
├── app/              # Expo Router pages
│   ├── (tabs)/      # Tab navigation
│   │   └── chat.tsx # Chat screen
│   └── _layout.tsx  # Root layout with ApolloProvider
├── components/
│   └── chat/        # Chat components
│       ├── ChannelList.tsx
│       ├── MessageList.tsx
│       └── MessageInput.tsx
├── lib/
│   ├── apollo-client.ts  # Apollo Client config
│   └── graphql/          # GraphQL queries/mutations
└── package.json
```

## Known Issues

### Apollo Client Version

We use `@apollo/client@3.11.8` (not 4.x) for better Expo compatibility.

If you see `tslib` errors, make sure you're using version 3.x:

```bash
npm list @apollo/client
```

## Troubleshooting

### Clear Metro Cache

If you see bundler errors:

```bash
npx expo start --clear
```

### Port Already in Use

```bash
kill $(lsof -t -i:8081)
npx expo start
```
