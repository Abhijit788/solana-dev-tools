# Solana Developer Tool

A comprehensive suite of tools for Solana blockchain development built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Account Explorer**: Explore Solana accounts and their data
- **Transaction Builder**: Build and simulate Solana transactions  
- **Program Inspector**: Analyze Solana programs and their instructions
- **Network Statistics**: View real-time Solana network metrics
- **Token Inspector**: Inspect SPL tokens and their metadata
- **Validator Tools**: Tools for Solana validators and staking

## Project Structure

```
src/
├── components/ui/      # Reusable UI components
├── lib/               # Utility modules and helpers
├── types/             # TypeScript interfaces and types
├── config/            # Application and Solana network configuration
├── hooks/             # Custom React hooks
└── app/               # Next.js App Router pages and layouts
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd solana-dev-tool
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
pnpm build
```

## Configuration

The project includes configuration files for:

- **Application**: `src/config/app.ts` - General app configuration
- **Solana Networks**: `src/config/solana.ts` - Solana network endpoints and settings
- **pnpm**: `.pnpmrc` - Package manager configuration with auto-install-peers

## Development

This project uses:

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **pnpm** for package management
- **ESLint** for code linting

### UI Components

Reusable UI components are located in `src/components/ui/` and built with Tailwind CSS. Current components include:

- Button - Customizable button component with multiple variants
- Card - Flexible card component for content display

### Utilities

Common utilities and helpers are in `src/lib/utils.ts`, including:

- `cn()` - Tailwind class merging utility
- `formatNumber()` - Number formatting with suffixes
- `formatSOL()` - SOL amount formatting
- `truncateAddress()` - Address truncation for display

### Custom Hooks

Reusable React hooks are in `src/hooks/index.ts`:

- `useLocalStorage` - Local storage state management
- `useClipboard` - Clipboard operations
- `useDebounce` - Value debouncing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
