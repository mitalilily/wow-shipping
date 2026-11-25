import { Client } from '../../.codex-tools/sources/BabylonJS--Spector.js/mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js';
import { StdioClientTransport } from '../../.codex-tools/sources/BabylonJS--Spector.js/mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.join(root, '.codex-tools/validation');
await mkdir(out, { recursive: true });
const servers = JSON.parse(await readFile(path.join(root, '.codex-tools/mcp-servers.json'), 'utf8'));
for (const [name, config] of Object.entries(servers)) {
  const client = new Client({name:'codex-setup-validation', version:'1.0.0'});
  const transport = new StdioClientTransport({...config, env:{...process.env, ...config.env}, stderr:'pipe'});
  let stderr = '';
  try {
    await client.connect(transport);
    transport.stderr?.on('data', data => stderr += data.toString());
    const catalog = await client.listTools();
    await writeFile(path.join(out, `${name}-catalog.json`), JSON.stringify(catalog, null, 2));
    console.log(name, catalog.tools.length, 'tools:', catalog.tools.map(t=>t.name).join(', '));
  } catch (error) {
    console.error(name, String(error), stderr);
    process.exitCode = 1;
  } finally { await client.close(); }
}
