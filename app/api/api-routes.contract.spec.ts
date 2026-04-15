import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const API_ROOT = path.resolve(process.cwd(), 'app/api');
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'] as const;

function listRouteFiles(dir: string): string[] {
  const output: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      output.push(...listRouteFiles(absolutePath));
      continue;
    }

    if (entry.isFile() && entry.name === 'route.ts') {
      output.push(absolutePath);
    }
  }

  return output.sort((a, b) => a.localeCompare(b));
}

function getExportedHttpMethods(sourceCode: string): string[] {
  const methods = new Set<string>();
  const methodPattern = new RegExp(
    String.raw`export\s+(?:async\s+)?function\s+(${HTTP_METHODS.join('|')})\b|export\s+const\s+(${HTTP_METHODS.join('|')})\b`,
    'g'
  );

  for (const match of sourceCode.matchAll(methodPattern)) {
    const method = match[1] || match[2];
    if (method) methods.add(method);
  }

  return [...methods].sort();
}

describe('API route contracts', () => {
  const routeFiles = listRouteFiles(API_ROOT);

  it('discovers API route files', () => {
    expect(routeFiles.length).toBeGreaterThan(0);
  });

  it.each(routeFiles)('%s exports at least one HTTP method', (routeFile) => {
    const sourceCode = fs.readFileSync(routeFile, 'utf8');
    const methods = getExportedHttpMethods(sourceCode);
    expect(methods.length).toBeGreaterThan(0);
  });

  it('all /api/jobs routes are protected by verifySignatureAppRouter', () => {
    const jobRouteFiles = routeFiles.filter((routeFile) => routeFile.includes(`${path.sep}app${path.sep}api${path.sep}jobs${path.sep}`));
    expect(jobRouteFiles.length).toBeGreaterThan(0);

    for (const routeFile of jobRouteFiles) {
      const sourceCode = fs.readFileSync(routeFile, 'utf8');
      expect(sourceCode).toContain('verifySignatureAppRouter');
    }
  });
});
