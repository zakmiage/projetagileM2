import { defineConfig } from 'vitest/config';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';

/**
 * Plugin Vite : remplace templateUrl/styleUrls par du contenu inline
 * au moment du transform, pour que TestBed puisse compiler les composants
 * standalone sans serveur HTTP ni resolveComponentResources.
 */
function angularInlineTemplatesPlugin() {
  return {
    name: 'vite-plugin-angular-inline-templates',
    transform(code: string, id: string) {
      if (!id.endsWith('.ts') || id.includes('node_modules') || id.includes('.spec.')) return;

      let transformed = code;

      // Inline templateUrl → template
      transformed = transformed.replace(
        /templateUrl:\s*['"`]([^'"`]+)['"`]/g,
        (_match, url: string) => {
          const templatePath = resolve(dirname(id), url);
          try {
            const content = readFileSync(templatePath, 'utf-8')
              .replace(/\\/g, '\\\\')
              .replace(/`/g, '\\`')
              .replace(/\$\{/g, '\\${');
            return `template: \`${content}\``;
          } catch {
            return 'template: ""';
          }
        }
      );

      // Inline styleUrls → styles (tableau)
      transformed = transformed.replace(
        /styleUrls:\s*\[([^\]]+)\]/g,
        (_match, urls: string) => {
          const styleContents = urls
            .split(',')
            .map((u: string) => u.trim().replace(/['"`]/g, ''))
            .map((url: string) => {
              const stylePath = resolve(dirname(id), url);
              try {
                const content = readFileSync(stylePath, 'utf-8')
                  .replace(/\\/g, '\\\\')
                  .replace(/`/g, '\\`')
                  .replace(/\$\{/g, '\\${');
                return `\`${content}\``;
              } catch {
                return '""';
              }
            });
          return `styles: [${styleContents.join(', ')}]`;
        }
      );

      return transformed !== code ? { code: transformed } : undefined;
    }
  };
}

export default defineConfig({
  plugins: [angularInlineTemplatesPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts']
  }
});
