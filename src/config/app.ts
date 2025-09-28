// Application configuration
export const config = {
  appName: 'Solana Developer Tool',
  version: '1.0.0',
  author: 'Your Name',
  description: 'A comprehensive developer tool for Solana blockchain development',
} as const;

// Environment configuration
export const env = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
} as const;