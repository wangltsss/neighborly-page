# Client

React Native Web frontend for Neighborly application.

## Technology Stack

- **Framework**: React Native (via Expo)
- **Build Tool**: Expo (with web support via react-native-web)
- **Language**: TypeScript
- **Routing**: Expo Router (file-based routing)
- **Styling**: React Native StyleSheet + TailwindCSS (via NativeWind - to be configured)

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

**Requirements:**
- Node.js 20+ and npm 10+
- For Android: Android Studio
- For iOS: macOS with Xcode
- For more details see package.json

## Development

### Start Development Server
```bash
npm start          # Start Expo dev server (choose platform)
npm run web        # Run on web browser
npm run android    # Run on Android (requires Android Studio)
npm run ios        # Run on iOS (requires macOS + Xcode)
```

### Web Development
```bash
npm run web
```
Then open `http://localhost:8081` in your browser if it's not open automatically.

