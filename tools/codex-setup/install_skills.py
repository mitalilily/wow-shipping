"""Use the bundled official installer, preserve provenance, adapt Codex metadata."""
import collections
import hashlib
import json
import pathlib
import re
import shutil
import subprocess
import sys
import yaml

ROOT = pathlib.Path(__file__).resolve().parents[2]
CACHE = ROOT / '.codex-tools'
DEST = ROOT / '.agents/skills'
INSTALLER = pathlib.Path.home() / '.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py'

def adapt(directory, item):
    md = directory / 'SKILL.md'
    text = md.read_text(encoding='utf-8-sig')
    item['original_skill_sha256'] = hashlib.sha256(md.read_bytes()).hexdigest()
    match = re.match(r'^---\n(.*?)\n---', text, re.S)
    front = match.group(1)
    # Repair an upstream unquoted colon in the description without changing its wording.
    if item['upstream_name'] == '3d-metal-material':
        front = '\n'.join('description: ' + json.dumps(line[len('description: '):])
                          if line.startswith('description: ') else line for line in front.splitlines())
    meta = yaml.safe_load(front)
    edits = []
    if item['name'] != item['upstream_name']:
        meta['name'] = item['name']
        edits.append('Renamed to avoid collision with cesartevisual threejs-scene')
    for key in ('hidden', 'argument-hint'):
        if key in meta:
            meta.setdefault('metadata', {})['upstream-' + key] = str(meta.pop(key))
            edits.append('Moved unsupported ' + key + ' into metadata')
    if not item['upstream_valid'] and item['upstream_name'] == '3d-metal-material':
        edits.append('Quoted upstream YAML description containing colon')
    if edits:
        text = '---\n' + yaml.safe_dump(meta, allow_unicode=True, sort_keys=False).strip() + '\n---' + text[match.end():]
        md.write_text(text, encoding='utf-8', newline='\n')
    item['adaptations'] = edits
    item['location'] = str(directory.relative_to(ROOT)).replace('\\', '/')
    item['status'] = 'installed'

def main():
    items = json.loads((CACHE / 'selected-skills.json').read_text(encoding='utf-8'))
    groups = collections.defaultdict(list)
    for item in items:
        groups[item['repo']].append(item)
    for repo, group in groups.items():
        print('Installing', repo, len(group), 'skills', flush=True)
        staging = CACHE / 'skill-staging' / repo.replace('/', '--')
        missing = [x for x in group if not (DEST / x['name'] / 'SKILL.md').exists()]
        if missing:
            # DevTools skills must match the installed release, not unreleased main.
            if repo == 'ChromeDevTools/chrome-devtools-mcp':
                for item in missing:
                    src = CACHE / 'node_modules/chrome-devtools-mcp' / item['path']
                    shutil.copytree(src, DEST / item['name'])
                    item['sha'] = 'npm:chrome-devtools-mcp@1.12.0'
            else:
                to_fetch = [x for x in missing if not (staging / pathlib.PurePosixPath(x['path']).name / 'SKILL.md').exists()]
                if to_fetch:
                    command = [sys.executable, '-X', 'utf8', str(INSTALLER), '--repo', repo,
                               '--ref', group[0]['sha'], '--dest', str(staging), '--path']
                    command += [x['path'] for x in to_fetch]
                    proc = subprocess.run(command, capture_output=True, text=True, encoding='utf-8', timeout=600)
                    print(proc.stdout.strip(), proc.stderr.strip(), flush=True)
                    if proc.returncode:
                        for item in missing:
                            item['status'] = 'failed'
                            item['error'] = proc.stderr.strip()
                        continue
                for item in missing:
                    src = staging / pathlib.PurePosixPath(item['path']).name
                    shutil.copytree(src, DEST / item['name'])
        for item in group:
            directory = DEST / item['name']
            adapt(directory, item)
            source_root = CACHE / 'sources' / repo.replace('/', '--')
            licenses = [x for x in source_root.glob('LICENSE*') if x.is_file()]
            for license_file in licenses:
                if not (directory / license_file.name).exists():
                    shutil.copy2(license_file, directory / license_file.name)
        # Update Open 3D's internal references to its disambiguated skill name.
        if repo == 'Moh4696/open-3d-skills':
            for item in group:
                for md in (DEST / item['name']).rglob('*.md'):
                    text = md.read_text(encoding='utf-8')
                    md.write_text(re.sub(r'(?<![\w-])threejs-scene(?![\w-])', 'open3d-threejs-scene', text), encoding='utf-8', newline='\n')
        (CACHE / 'installed-skills.json').write_text(json.dumps(items, indent=2), encoding='utf-8')
        print('Installed', repo, flush=True)
    (CACHE / 'installed-skills.json').write_text(json.dumps(items, indent=2), encoding='utf-8')

if __name__ == '__main__':
    main()
