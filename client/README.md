# Neighborly Client Setup

React Native Web app for Neighborly community platform.

## Prerequisites

- Node.js 18+
- npm or yarn

## Installation

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
