import fs from 'node:fs/promises';

export async function copyFrontendFiles(folder, htmlReplacement = '') {
    let html = await fs.readFile('frontend/index.html', 'utf8');
    html = html.replace('<!-- inject:reload-script -->', htmlReplacement);
    await fs.writeFile(`dist/${folder}/public/index.html`, html);
    await fs.copyFile('frontend/main.css', `dist/${folder}/public/main.css`);
    await fs.copyFile('frontend/preload-config.json', `dist/${folder}/public/preload-config.json`);
    await fs.cp('frontend/assets', `dist/${folder}/public/assets`, { recursive: true })
}