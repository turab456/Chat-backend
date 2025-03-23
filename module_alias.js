import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

// Get the base directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const aliases = {
  '@src': path.resolve(__dirname, './src'),
  '@config': path.resolve(__dirname, './src/config'),
  '@models': path.resolve(__dirname, './src/models'),
  '@controllers': path.resolve(__dirname, './src/controllers'),
  '@middlewares': path.resolve(__dirname, './src/middlewares'),
  '@routes': path.resolve(__dirname, './src/routes'),
  '@utils': path.resolve(__dirname, './src/utils'),
};

export function resolveAlias(alias) {
  if (aliases[alias]) {
    // ✅ Convert path to a file:// URL
    return pathToFileURL(aliases[alias]).href;
  }
  throw new Error(`Alias '${alias}' not found`);
}
