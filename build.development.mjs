import esbuild from 'esbuild';
import chokidar from 'chokidar';
import { spawn } from 'child_process';
import { WebSocket, WebSocketServer } from 'ws';
import fs from 'node:fs/promises';
import { generatePreloadConfig } from './generate-preload-config.mjs'
import { copyFrontendFiles } from './build.snippets.mjs';

const liveReloadPort = 3456;
const clients = new Set();

// LiveReload plugin
const liveReloadPlugin = {
    name: 'live-reload',
    setup(build) {
        build.onEnd(() => {
            console.log('🔁 Notifying clients to reload...');
            for (const client of clients) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send('reload');
                }
            }
        });
    },
};

let backendProcess = null;
function restartBackend() {
    if (backendProcess) backendProcess.kill();

    esbuild
        .build({
            entryPoints: ['backend/index.ts'],
            bundle: true,
            platform: 'node',
            outfile: 'dist/development/server.js',
            sourcemap: true,
            plugins: [liveReloadPlugin],
        })
        .then(() => {
            backendProcess = spawn('node', ['dist/development/server.js'], {
                stdio: 'inherit',
            });
            console.log('✅ Backend restarted');
        })
        .catch(err => {
            console.error('❌ Backend build error:', err);
        });
}

(async () => {
    await generatePreloadConfig();

    await fs.rm('dist/development', { recursive: true, force: true });
    await fs.mkdir('dist/development/public/assets', { recursive: true });

    const reloadScript = `
    <script>
        const ws = new WebSocket('ws://localhost:${liveReloadPort}');
        ws.onmessage = (msg) => {
            if (msg.data === 'reload') location.reload();
        };
    </script>
    `;
    await copyFrontendFiles('development', reloadScript);

    const ctx = await esbuild.context({
        entryPoints: ['frontend/index.ts'],
        bundle: true,
        outfile: 'dist/development/public/index.js',
        sourcemap: true,
        format: 'esm',
        plugins: [liveReloadPlugin],
    });

    await ctx.watch();
    console.log('👀 Watching frontend...');

    chokidar.watch('backend').on('change', () => {
        console.log('🔁 Backend changed');
        restartBackend();
    });

    const wss = new WebSocketServer({ port: liveReloadPort });
    wss.on('connection', ws => {
        console.log(`🌐 Client connected for reload`);
        clients.add(ws);
        ws.on('close', () => clients.delete(ws));
    });

    restartBackend();
})();
