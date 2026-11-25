"""Download requested sources for inspection; never execute repository code."""
import concurrent.futures
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[2]
CACHE = ROOT / '.codex-tools'
REPOS = [
    'santowilem/skills', 'greensock/gsap-skills',
    'cesartevisual/threejs-skills', 'Moh4696/open-3d-skills',
    'MengTo/Skills', 'vercel-labs/agent-browser',
    'nextlevelbuilder/ui-ux-pro-max-skill',
    'ChromeDevTools/chrome-devtools-mcp', 'BabylonJS/Spector.js',
    'braxtonROSE4/clone-any-website',
]

def inspect(repo):
    dest = CACHE / 'sources' / repo.replace('/', '--')
    dest.parent.mkdir(parents=True, exist_ok=True)
    if not dest.exists():
        p = subprocess.run(['git', '-c', 'credential.interactive=never', 'clone',
                            '--depth=1', 'https://github.com/' + repo + '.git', str(dest)],
                           capture_output=True, text=True, timeout=180,
                           env=__import__('os').environ | {'GIT_TERMINAL_PROMPT': '0'})
        if p.returncode:
            return {'repo': repo, 'error': p.stderr.strip()}
    sha = subprocess.check_output(['git', '-C', str(dest), 'rev-parse', 'HEAD'], text=True).strip()
    files = [p for p in dest.rglob('*') if p.is_file() and '.git' not in p.relative_to(dest).parts]
    skills = [str(p.relative_to(dest)).replace('\\', '/') for p in files if p.name == 'SKILL.md']
    docs = [str(p.relative_to(dest)).replace('\\', '/') for p in files
            if p.parent == dest and p.name.lower().startswith(('readme', 'license', 'copying', 'package.json'))]
    return {'repo': repo, 'path': str(dest), 'sha': sha, 'skills': skills, 'docs': docs}

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        results = list(pool.map(inspect, REPOS))
    (CACHE / 'repository-inspection.json').write_text(json.dumps(results, indent=2), encoding='utf-8')
    for result in results:
        print(json.dumps(result), flush=True)
