"""Write only project-scoped MCP entries, preserving any unrelated TOML."""
import json
import pathlib
import shutil
import tomllib

ROOT = pathlib.Path(__file__).resolve().parents[2]
CACHE = ROOT / '.codex-tools'
config = ROOT / '.codex/config.toml'
existing = config.read_text(encoding='utf-8') if config.exists() else ''
parsed = tomllib.loads(existing)
node = shutil.which('node')
assert node
servers = {
    'chrome-devtools': {
        'command': node,
        'args': [str(CACHE / 'node_modules/chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js'),
                 '--headless', '--isolated', '--no-usage-statistics', '--no-performance-crux',
                 '--executablePath=C:/Program Files/Google/Chrome/Application/chrome.exe',
                 '--viewport=1440x900', '--workspace=' + str(ROOT)],
        'cwd': str(ROOT),
        'env': {'CHROME_DEVTOOLS_MCP_NO_UPDATE_CHECKS': '1'},
    },
    'agent-browser': {
        'command': str(CACHE / 'node_modules/agent-browser/bin/agent-browser-win32-x64.exe'),
        'args': ['--session', 'codex-landing-mcp', 'mcp'],
        'cwd': str(ROOT),
        'env': {'AGENT_BROWSER_SOCKET_DIR': str(CACHE / 'agent-browser-sessions')},
    },
    'spector': {
        'command': node,
        'args': [str(CACHE / 'sources/BabylonJS--Spector.js/mcp/dist/index.js')],
        'cwd': str(ROOT),
        'env': {},
    },
}
lines = [existing.rstrip(), '# Project-local browser inspection tools; isolated profiles.']
for name, server in servers.items():
    if name in parsed.get('mcp_servers', {}):
        raise SystemExit(f'Existing server {name} preserved; inspect before updating')
    lines += ['', f'[mcp_servers.{name}]', 'command = ' + json.dumps(server['command']),
              'args = ' + json.dumps(server['args']), 'cwd = ' + json.dumps(server['cwd']),
              'startup_timeout_sec = 60', 'tool_timeout_sec = 120', 'enabled = true']
    if server['env']:
        lines += ['', f'[mcp_servers.{name}.env]']
        lines += [key + ' = ' + json.dumps(value) for key, value in server['env'].items()]
output = '\n'.join(lines).lstrip() + '\n'
tomllib.loads(output)
config.parent.mkdir(exist_ok=True)
config.write_text(output, encoding='utf-8')
(CACHE / 'mcp-servers.json').write_text(json.dumps(servers, indent=2), encoding='utf-8')
print('Configured project MCP:', ', '.join(servers))
