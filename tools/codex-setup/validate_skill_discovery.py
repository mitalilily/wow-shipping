"""Ask this installed Codex app-server to discover the project's skills."""
import json
import pathlib
import queue
import shutil
import subprocess
import threading
import time

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / '.codex-tools/validation'
OUT.mkdir(parents=True, exist_ok=True)
proc = subprocess.Popen([shutil.which('codex'), 'app-server', '--stdio'], cwd=ROOT,
                        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                        text=True, encoding='utf-8', creationflags=subprocess.CREATE_NO_WINDOW)
messages = queue.Queue()
errors = []
def drain_stdout():
    for line in proc.stdout:
        try: messages.put(json.loads(line))
        except json.JSONDecodeError: pass
def drain_stderr():
    for line in proc.stderr: errors.append(line)
threading.Thread(target=drain_stdout, daemon=True).start()
threading.Thread(target=drain_stderr, daemon=True).start()
def send(message):
    proc.stdin.write(json.dumps(message) + '\n')
    proc.stdin.flush()
def response(identifier):
    deadline = time.monotonic() + 60
    while time.monotonic() < deadline:
        item = messages.get(timeout=max(0.1, deadline-time.monotonic()))
        if item.get('id') == identifier:
            if 'error' in item: raise RuntimeError(item['error'])
            return item['result']
    raise TimeoutError('Codex discovery did not respond')
try:
    send({'id':1,'method':'initialize','params':{'clientInfo':{'name':'local-skill-validation','version':'1.0.0'}}})
    response(1)
    send({'method':'initialized','params':{}})
    send({'id':2,'method':'skills/list','params':{'cwds':[str(ROOT)],'forceReload':True}})
    result = response(2)
    (OUT / 'codex-skills-discovery.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print('Codex skills/list result saved')
    for entry in result.get('data', []):
        skills = entry.get('skills', [])
        local = [x for x in skills if str(ROOT).lower() in x.get('path','').lower()]
        print('Discovered project skills:',len(local))
        print('Custom skill:',[(x['name'],x.get('enabled'),x['path']) for x in local if x['name']=='pixel-perfect-website-cloner'])
        print('Discovery errors:',entry.get('errors',[]))
finally:
    proc.terminate()
    try: proc.wait(timeout=10)
    except subprocess.TimeoutExpired: proc.kill()
    (OUT / 'codex-discovery-stderr.log').write_text(''.join(errors),encoding='utf-8')
