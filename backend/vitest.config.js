import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.js'],
    server: {
      deps: {
        // Forcer le re-bundling des modules CJS pour que vi.mock() fonctionne
        interopDefault: true
      }
    }
  }
});
