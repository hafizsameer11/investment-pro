# InvestPro - React Native Investment App

A beautiful, production-quality React Native investment platform built with Expo, TypeScript, and modern development practices.

## 🚀 Features

- **Multi-Level Referral System** - Earn from 5 levels deep
- **Investment Plans** - Starter, Growth, and Premium plans with different returns
- **Crypto Deposits & Withdrawals** - Support for USDT, Bitcoin, Ethereum, and Dogecoin
- **24-Hour Mining Sessions** - Persistent mining with real-time progress tracking
- **Beautiful UI/UX** - Modern design with smooth animations and intuitive navigation
- **Form Validation** - Robust validation using react-hook-form and zod
- **State Management** - AsyncStorage for simple and efficient data persistence
- **API Ready** - Structured API endpoints for easy backend integration

## 📱 Screens

- **Dashboard** - Overview with stats, network structure, and recent activity
- **Plans** - Investment plans with detailed features and referral bonuses
- **Deposit** - Crypto deposit form with validation and instructions
- **Withdraw** - Secure withdrawal process with OTP verification
- **Referrals** - Multi-level network visualization and referral code sharing
- **About** - Company information, security features, and contact details
- **Mining** - 24-hour mining sessions with persistent progress tracking

## 🛠 Tech Stack

- **Framework**: React Native with Expo (Managed Workflow)
- **Language**: TypeScript
- **Navigation**: @react-navigation/bottom-tabs
- **State Management**: AsyncStorage for data persistence
- **Storage**: @react-native-async-storage/async-storage
- **Forms**: react-hook-form with zod validation
- **Styling**: Inline React Native styles
- **Icons**: @expo/vector-icons (Ionicons)
- **Date/Time**: dayjs
- **HTTP Client**: Axios

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd invest-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API URL:
   ```
   EXPO_PUBLIC_API_URL=https://your-api-url.com
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## 🏃‍♂️ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run linting
npm run lint

# Type checking
npm run typecheck
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=https://api.investpro.com
```

### API Integration

The app includes a complete API structure in `src/api/`:

- `client.ts` - Axios instance with interceptors
- `endpoints.ts` - All API endpoint functions

To integrate with your backend:

1. Update the base URL in `src/api/client.ts`
2. Implement the API calls in `src/api/endpoints.ts`
3. Replace TODO comments with actual API calls

## 📁 Project Structure

```
src/
├── api/
│   ├── client.ts          # Axios configuration
│   └── endpoints.ts       # API endpoint functions
├── components/
│   └── UI.tsx            # Reusable UI components
├── screens/
│   ├── DashboardScreen.tsx
│   ├── PlansScreen.tsx
│   ├── DepositScreen.tsx
│   ├── WithdrawScreen.tsx
│   ├── ReferralsScreen.tsx
│   ├── AboutScreen.tsx
│   └── MiningScreen.tsx
├── store/
│   ├── app.ts            # Main app state
│   └── onboarding.ts     # Onboarding state
└── utils/
    └── format.ts         # Utility functions
```

## 🎨 UI Components

The app includes a comprehensive UI component library:

- **Card** - Rounded cards with shadows
- **Button** - Primary, secondary, and danger variants
- **Input** - Form inputs with validation
- **Stat** - Statistics display with icons
- **SectionTitle** - Section headers with subtitles

## 🔐 Security Features

- Form validation with zod schemas
- Secure input handling
- OTP verification for withdrawals
- Wallet address validation
- Password protection for sensitive operations

## 📊 State Management

The app uses AsyncStorage for simple and efficient data persistence:

- **App State**: User data, balances, mining sessions
- **Onboarding**: First-run experience
- **Persistence**: AsyncStorage for data persistence

## 🧪 QA Checklist

Before deploying, ensure the following:

### Navigation
- [ ] Navigates across all tabs with no warnings
- [ ] Tab icons display correctly
- [ ] Active tab highlighting works
- [ ] No navigation errors in console

### Forms
- [ ] Forms mount without redbox on iOS and Android
- [ ] Validation works correctly
- [ ] Error messages display properly
- [ ] Form submission handles errors gracefully

### Mining Feature
- [ ] Mining persists across reloads
- [ ] Progress updates in real-time
- [ ] Session state survives app restarts
- [ ] Timer accuracy maintained across device time changes

### General
- [ ] ESLint passes with no errors
- [ ] TypeScript compilation successful
- [ ] No console warnings or errors
- [ ] App works on both iOS and Android
- [ ] All images and icons load correctly

## 🚀 Deployment

### Expo Build

```bash
# Build for iOS
expo build:ios

# Build for Android
expo build:android

# Build for web
expo build:web
```

### EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for platforms
eas build --platform ios
eas build --platform android
```

## 📱 Platform Support

- **iOS**: 12.0+
- **Android**: 5.0+ (API level 21+)
- **Web**: Modern browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- **Email**: support@investpro.com
- **Phone**: 1-800-INVEST (24/7)
- **Live Chat**: Available 24/7 in the app

## 🔄 Updates

Stay updated with the latest features and improvements:

- Follow our WhatsApp channel for updates
- Check the app's About section for latest version
- Monitor the GitHub repository for releases

---

**InvestPro** - Your trusted partner in intelligent investing. 🚀

