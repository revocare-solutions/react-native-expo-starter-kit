import fs from 'fs-extra';
import path from 'path';

export async function removeFeatureFiles(projectRoot: string, filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    const fullPath = path.join(projectRoot, filePath);
    if (await fs.pathExists(fullPath)) {
      await fs.remove(fullPath);
    }
  }
}

export function cleanPackageJson(
  pkg: Record<string, unknown>,
  depsToRemove: string[],
  devDepsToRemove: string[],
): Record<string, unknown> {
  const deps = { ...(pkg.dependencies as Record<string, string> | undefined) };
  const devDeps = { ...(pkg.devDependencies as Record<string, string> | undefined) };

  for (const dep of depsToRemove) {
    delete deps[dep];
  }
  for (const dep of devDepsToRemove) {
    delete devDeps[dep];
  }

  return { ...pkg, dependencies: deps, devDependencies: devDeps };
}

export function updateEnvExample(content: string, keepVars: string[]): string {
  const lines = content.split('\n');
  const result: string[] = [];
  const pendingComments: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      if (result.length > 0) {
        pendingComments.push(line);
      }
      continue;
    }

    if (trimmed.startsWith('#')) {
      pendingComments.push(line);
      continue;
    }

    // It's an env var line
    const varName = trimmed.split('=')[0];
    if (keepVars.includes(varName)) {
      // Flush pending comments and blank lines
      result.push(...pendingComments);
      pendingComments.length = 0;
      result.push(line);
    } else {
      // Discard pending comments (they belonged to this removed var)
      pendingComments.length = 0;
    }
  }

  return result.join('\n').trim() + '\n';
}

export async function rewriteServiceFactory(
  filePath: string,
  removedProviders: string[],
): Promise<void> {
  if (!(await fs.pathExists(filePath))) return;

  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const result: string[] = [];
  let skipUntilNextEntry = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if this line starts a provider entry we want to remove
    const isProviderLine = removedProviders.some((p) => {
      const escaped = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`^['"]?${escaped}['"]?\\s*:`).test(trimmed);
    });

    if (isProviderLine) {
      // Skip this line and any continuation lines (lines that don't start a new entry or close the map)
      skipUntilNextEntry = !trimmed.endsWith(',');
      continue;
    }

    if (skipUntilNextEntry) {
      // Keep skipping until we find a line ending with comma (end of the entry)
      if (trimmed.endsWith(',')) {
        skipUntilNextEntry = false;
      }
      continue;
    }

    result.push(line);
  }

  await fs.writeFile(filePath, result.join('\n'));
}

export async function updateAppJson(
  projectRoot: string,
  appName: string,
  bundleId: string,
  scheme: string,
): Promise<void> {
  const appJsonPath = path.join(projectRoot, 'app.json');
  const appJson = await fs.readJson(appJsonPath);

  appJson.expo.name = appName;
  appJson.expo.slug = appName.toLowerCase().replace(/\s+/g, '-');
  appJson.expo.scheme = scheme;

  if (!appJson.expo.ios) appJson.expo.ios = {};
  appJson.expo.ios.bundleIdentifier = bundleId;

  if (!appJson.expo.android) appJson.expo.android = {};
  appJson.expo.android.package = bundleId;

  await fs.writeJson(appJsonPath, appJson, { spaces: 2 });
}
