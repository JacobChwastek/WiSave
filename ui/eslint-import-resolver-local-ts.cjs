'use strict';

const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const DEFAULT_PROJECTS = ['./tsconfig.json', './tsconfig.app.json', './tsconfig.spec.json'];
const configCache = new Map();

function normalizeProjects(project) {
  if (Array.isArray(project)) {
    return project;
  }

  if (typeof project === 'string') {
    return [project];
  }

  return DEFAULT_PROJECTS;
}

function resolveTsConfigPath(projectPath, sourceFile) {
  if (path.isAbsolute(projectPath)) {
    return projectPath;
  }

  const sourceDir = sourceFile ? path.dirname(sourceFile) : process.cwd();
  const fromSource = path.resolve(sourceDir, projectPath);
  if (fs.existsSync(fromSource)) {
    return fromSource;
  }

  return path.resolve(process.cwd(), projectPath);
}

function loadCompilerOptions(projectPath, sourceFile) {
  const tsconfigPath = resolveTsConfigPath(projectPath, sourceFile);

  if (configCache.has(tsconfigPath)) {
    return configCache.get(tsconfigPath);
  }

  if (!fs.existsSync(tsconfigPath)) {
    configCache.set(tsconfigPath, null);
    return null;
  }

  const readConfig = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (readConfig.error) {
    configCache.set(tsconfigPath, null);
    return null;
  }

  const parsed = ts.parseJsonConfigFileContent(readConfig.config, ts.sys, path.dirname(tsconfigPath));
  const compilerOptions = parsed.options || {};

  configCache.set(tsconfigPath, compilerOptions);
  return compilerOptions;
}

module.exports = {
  interfaceVersion: 2,

  resolve(source, file, config) {
    const projects = normalizeProjects(config && config.project);

    for (const projectPath of projects) {
      const compilerOptions = loadCompilerOptions(projectPath, file);
      if (!compilerOptions) {
        continue;
      }

      const result = ts.resolveModuleName(source, file, compilerOptions, ts.sys);
      const resolvedFileName = result && result.resolvedModule && result.resolvedModule.resolvedFileName;
      if (resolvedFileName) {
        return { found: true, path: resolvedFileName };
      }
    }

    return { found: false };
  },
};
