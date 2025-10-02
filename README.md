# Solana Developer Tool

A comprehensive suite of tools for Solana blockchain development built with Next.js 15, TypeScript, and Tailwind CSS. This application provides essential utilities for Solana developers including transaction analysis, fee estimation, and batch operations.

## 🚀 Current Features

### **Available Tools**

- **🔍 Transaction History**: View wallet transactions with detailed compute unit analysis, fee breakdowns, and transaction status
- **⚡ Transaction Simulator**: Build and simulate Solana transactions with compute unit estimation before sending
- **💰 Priority Fee Calculator**: Real-time transaction cost estimation based on current network conditions
- **📦 Batch Transaction Builder**: Combine multiple instructions into optimized batches to reduce overall costs

### **Core Features**

- **🔐 Multi-Wallet Support**: Connect with Phantom, Solflare, and Coinbase Wallet
- **🌐 Devnet Integration**: Safe development environment using Solana Devnet
- **📱 Responsive Design**: Mobile-friendly interface with dark theme
- **🔔 Toast Notifications**: Real-time feedback for user actions and errors
- **📖 Comprehensive Documentation**: Built-in documentation with guides and FAQ
- **🎨 Modern UI**: Clean, professional interface built with Radix UI components

### **Coming Soon**

- Account Explorer
- Program Inspector
- Network Statistics
- Token Inspector
- Validator Tools
- RPC Health Monitor

## 🏗️ Project Structure

```
src/
├── app/
│   ├── docs/           # Documentation pages
│   ├── layout.tsx      # Root layout with providers
│   └── page.tsx        # Homepage with tool cards
├── components/
│   ├── ui/             # Reusable UI components (Button, Card, Toast, etc.)
│   ├── layout/         # Layout components (Header with wallet integration)
│   ├── providers/      # Context providers (WalletProvider)
│   ├── compute/        # Transaction analysis components
│   └── batch/          # Batch transaction tools
├── hooks/
│   ├── useRecentTransactions.ts  # Fetch and manage transaction data
│   └── use-toast.ts             # Toast notification management
├── lib/
│   ├── solanaClient.ts # Solana connection with multiple endpoints
│   └── utils.ts        # Utility functions
├── mocks/              # MSW API mocking for development
└── types/              # TypeScript interfaces
```

## 🚦 Getting Started

### Prerequisites

- **Node.js 18+** (recommended: Node.js 20)
- **pnpm** (recommended package manager)
- **Solana Wallet Extension** (Phantom, Solflare, or Coinbase Wallet)

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/Abhijit788/solana-dev-tools.git
cd solana-dev-tool
```

2. **Install dependencies:**

```bash
pnpm install
```

3. **Run the development server:**

```bash
pnpm dev
```

4. **Open your browser:**
   - Navigate to [http://localhost:3001](http://localhost:3001)
   - Connect your Solana wallet (Devnet)
   - Start exploring the tools!

### Build for Production

```bash
pnpm build
pnpm start
```

## 🚀 Deployment

### **Vercel (Recommended)**

The easiest way to deploy your Solana Developer Tool:

1. **Connect to Vercel:**

   ```bash
   # Install Vercel CLI (already included in devDependencies)
   npx vercel login
   ```

2. **Deploy from GitHub:**

   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository: `https://github.com/Abhijit788/solana-dev-tools`
   - Vercel will auto-detect Next.js and configure everything

3. **Environment Variables (in Vercel Dashboard):**

   ```
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_APP_ENV=production
   ```

4. **Deploy:**
   ```bash
   npx vercel --prod
   ```

### **Alternative Deployment Options**

#### **Netlify**

```bash
# Build command: pnpm build
# Publish directory: .next
# Environment variables: Same as Vercel
```

#### **Railway**

```bash
railway login
railway new
railway connect
railway up
```

#### **Digital Ocean App Platform**

- Connect your GitHub repository
- Set build command: `pnpm build`
- Set run command: `pnpm start`

### **Environment Variables for Production**

Copy `.env.example` to `.env.local` and configure:

```bash
# Required
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_APP_ENV=production

# Optional - Custom RPC for better performance
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_CUSTOM_RPC_ENDPOINT=https://your-custom-rpc.com

# Optional - Analytics
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

## 🔧 Configuration & Technical Details

### **Network Configuration**

- **Default Network**: Solana Devnet (safe for testing)
- **RPC Endpoints**: Multiple fallback endpoints for reliability
- **Wallet Support**: Auto-detection of installed wallet extensions

### **Key Dependencies**

- **Next.js 15**: React framework with App Router
- **@solana/wallet-adapter**: Wallet integration library
- **@solana/web3.js**: Solana JavaScript SDK
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Static type checking

### **Development Tools**

- **MSW (Mock Service Worker)**: API mocking for development
- **ESLint**: Code linting and formatting
- **Turbopack**: Fast development bundler

## 💡 Usage Guide

### **Getting Started**

1. **Connect Wallet**: Click "Connect Wallet" in the header
2. **Select Network**: Ensure you're on Solana Devnet
3. **Explore Tools**: Use the tool cards to navigate to different features

### **Transaction History**

- View your recent transactions with detailed analysis
- See compute units used vs allocated
- Monitor transaction fees and costs
- Click transaction signatures to view on Solscan

### **Transaction Simulator**

- Build custom transactions before sending
- Estimate compute unit requirements
- Calculate total transaction costs
- Validate transaction structure

### **Priority Fee Calculator**

- Get real-time network fee recommendations
- Optimize transaction costs based on congestion
- View historical fee trends

### **Batch Transaction Builder**

- Combine multiple operations efficiently
- Reduce overall transaction costs
- Optimize compute unit usage across instructions

## 🛠️ Development

### **Key Components**

#### **UI Components** (`src/components/ui/`)

- `Button` - Customizable button with multiple variants
- `Card` - Flexible card layout component
- `Toast` - Notification system with dark theme
- `Toaster` - Toast container and management

#### **Feature Components**

- `TransactionList` - Display and analyze transaction history
- `SimulateTransactionForm` - Transaction simulation interface
- `PriorityFeeEstimator` - Real-time fee calculation
- `BatchTransactionBuilder` - Batch operation tools

#### **Custom Hooks** (`src/hooks/`)

- `useRecentTransactions` - Fetch and manage wallet transactions
- `use-toast` - Toast notification management

#### **Utilities** (`src/lib/`)

- `solanaClient.ts` - Solana connection with fallback endpoints
- `utils.ts` - Common utility functions for formatting and validation

### **Wallet Integration**

- **Auto-Connect**: Optional automatic wallet connection
- **Error Handling**: Comprehensive error management with user feedback
- **Network Detection**: Automatic network configuration
- **Multi-Wallet**: Support for multiple wallet types simultaneously

## 🔍 Troubleshooting

### **Common Issues**

**"Request timeout" errors:**

- Devnet can be slow during high usage
- Tool automatically retries with fallback endpoints
- Manual refresh available in transaction history

**Wallet connection issues:**

- Ensure wallet extension is installed and unlocked
- Try refreshing the page
- Check that you're on the correct network (Devnet)

**No transactions showing:**

- Confirm wallet is connected to Devnet
- Make sure you have recent transactions on Devnet
- Check browser console for any connection errors

### **Performance Tips**

- Keep wallet extension updated
- Use stable internet connection for best experience
- Clear browser cache if experiencing issues

## 🤝 Contributing

We welcome contributions to improve the Solana Developer Tool! Here's how you can help:

### **Getting Started**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Run linting: `pnpm lint`
5. Build the project: `pnpm build`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

### **Development Guidelines**

- Follow TypeScript best practices
- Maintain consistent code formatting
- Add JSDoc comments for complex functions
- Test your changes with different wallets
- Ensure mobile responsiveness

### **Areas for Contribution**

- Additional wallet adapter support
- New developer tools and features
- Performance optimizations
- UI/UX improvements
- Documentation enhancements
- Bug fixes and error handling

## 📚 Resources

- **[Live Demo](https://github.com/Abhijit788/solana-dev-tools)** - Try the tool online
- **[Solana Documentation](https://docs.solana.com/)** - Official Solana developer docs
- **[Wallet Adapter Docs](https://github.com/solana-labs/wallet-adapter)** - Wallet integration guide
- **[Solscan Explorer](https://solscan.io/)** - Blockchain explorer for Solana

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Solana Labs** for the amazing blockchain platform
- **Wallet Adapter Team** for seamless wallet integration
- **Next.js Team** for the excellent React framework
- **Radix UI** for accessible component primitives
