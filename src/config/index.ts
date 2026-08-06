import dotenv from 'dotenv';
import path from 'path';
import { validateEnvironment, config, printConfigSummary, printEnvironmentStatus } from '../lib/config';

// Load environment variables based on NODE_ENV
const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
const envPath = path.join(process.cwd(), envFile);

console.log(`📦 Loading environment from: ${envFile}`);

dotenv.config({ path: envPath });
dotenv.config({ path: '.env' }); // Fallback to .env if .env.{env} not found

// Validate environment
validateEnvironment();

// Print status in development
if (config.isDevelopment) {
  printEnvironmentStatus();
  printConfigSummary();
}

export default config;
