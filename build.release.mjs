import esbuild from 'esbuild';
import fs from 'node:fs/promises';
import { generatePreloadConfig } from './generate-preload-config.mjs'
import { copyFrontendFiles } from './build.snippets.mjs';

await generatePreloadConfig()
// Cleanup old build
await fs.rm('dist/release', { recursive: true, force: true });
await fs.mkdir('dist/release/public/assets', { recursive: true });

// Build frontend
esbuild.buildSync({
    entryPoints: ['frontend/index.ts'],
    bundle: true,
    minify: true,
    sourcemap: false,
    outfile: 'dist/release/public/index.js',
    format: 'esm',
});

// Build backend
esbuild.buildSync({
    entryPoints: ['backend/index.ts'],
    bundle: true,
    platform: 'node',
    outfile: 'dist/release/server.js',
    sourcemap: false,
});

await copyFrontendFiles('release');

console.log('✅ Release build complete');
