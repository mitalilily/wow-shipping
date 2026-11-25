"""Exercise isolated local browsers, CLI interactions, video, and screenshot comparison."""
import functools
import http.server
import json
import os
import shutil
from pathlib import Path
import subprocess
import sys
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / '.codex-tools/validation'
CACHE = ROOT / '.codex-tools'
env = os.environ.copy()
env['PATH'] = os.pathsep.join([str(CACHE/'node_modules/@ffmpeg-installer/win32-x64'),
                              str(CACHE/'node_modules/@ffprobe-installer/win32-x64'),env['PATH']])
env['AGENT_BROWSER_SOCKET_DIR'] = str(CACHE/'agent-browser-sessions')
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT/'tools/codex-setup/fixtures'))
server = http.server.ThreadingHTTPServer(('127.0.0.1',0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}/inspection.html'
resume = '--resume' in sys.argv
report = json.loads((OUT/'runtime-validation.json').read_text()) if resume else {}
def run(label, args, timeout=120):
    if resume and report.get(label,{}).get('status') == 'passed':
        return subprocess.CompletedProcess(args,0,(OUT/(label+'.log')).read_text(encoding='utf-8'),'')
    args = list(args)
    args[0] = shutil.which(str(args[0]), path=env['PATH']) or str(args[0])
    p = subprocess.run([str(x) for x in args], cwd=ROOT, env=env, capture_output=True,
                       text=True,encoding='utf-8',timeout=timeout,creationflags=subprocess.CREATE_NO_WINDOW)
    (OUT/(label+'.log')).write_text(p.stdout+'\n'+p.stderr,encoding='utf-8')
    report[label] = {'exit_code':p.returncode,'status':'passed' if p.returncode==0 else 'failed'}
    print(label,p.returncode,flush=True)
    if p.returncode: print((p.stdout+'\n'+p.stderr)[-2500:],flush=True)
    return p
try:
    with sync_playwright() as pw:
        for name in ('chromium','webkit'):
            if resume and report.get(name,{}).get('status')=='passed': continue
            try:
                browser = getattr(pw,name).launch(headless=True)
                page = browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1)
                page.goto(url)
                page.wait_for_function('window.__ready === true && window.validation.network')
                data = page.evaluate('({title:document.title,frames:validation.frames,network:validation.network,webgl:!!document.querySelector("canvas").getContext("webgl")})')
                assert data['frames'] > 0 and data['webgl']
                page.screenshot(path=str(OUT/f'{name}-baseline.png'))
                page.get_by_role('button',name='Record click').click()
                page.screenshot(path=str(OUT/f'{name}-clicked.png'))
                report[name] = {'status':'passed','version':browser.version,**data}
                print(name,'PASS',browser.version,flush=True)
                browser.close()
            except Exception as error:
                report[name]={'status':'failed','error':str(error)}
                print(name,str(error),flush=True)
    binary = CACHE/'node_modules/agent-browser/bin/agent-browser-win32-x64.exe'
    base=[binary,'--session','codex-cli-validation']
    try:
        run('cli-navigation',base+['open',url])
        run('cli-hover',base+['hover','#action'])
        p=run('cli-inspection',base+['eval','JSON.stringify({hovered:validation.hovered,color:getComputedStyle(document.querySelector("#action")).backgroundColor})'])
        assert 'true' in p.stdout and '120, 210, 190' in p.stdout,p.stdout
        run('cli-screenshot',base+['screenshot',OUT/'cli-fixture.png'])
    finally: run('cli-close',base+['close'])
    run('site-check',[sys.executable,ROOT/'.agents/skills/site-check/scripts/check.py',url,
                      '--out',OUT/'site-check','--browser','both','--widths','1440,390',
                      '--scroll-steps','1','--ready','window.__ready === true','--wait','0.1'])
    run('frame-capture',[sys.executable,ROOT/'.agents/skills/frame-capture/scripts/record.py',url,
                         OUT/'fixture-60fps.mp4','--seconds','0.5','--fps','60','--size','640x480',
                         '--ready','window.__ready === true','--settle','0','--preset','ultrafast'])
    p=run('ffprobe',['ffprobe','-v','error','-show_entries','stream=codec_name,width,height,r_frame_rate',
                      '-show_entries','format=duration','-of','json',OUT/'fixture-60fps.mp4'])
    if p.returncode==0:
        probe=json.loads(p.stdout)
        assert probe['streams'][0]['r_frame_rate']=='60/1',probe
        report['ffprobe']['probe']=probe
    compare=ROOT/'.agents/skills/pixel-perfect-website-cloner/scripts/compare_screenshots.py'
    same=run('comparison-identical',[sys.executable,compare,OUT/'chromium-baseline.png',OUT/'chromium-baseline.png','--out',OUT/'comparison-identical'])
    different=run('comparison-different',[sys.executable,compare,OUT/'chromium-baseline.png',OUT/'chromium-clicked.png','--out',OUT/'comparison-different'])
    assert json.loads(same.stdout)['changed_pixel_fraction']==0
    assert json.loads(different.stdout)['changed_pixel_fraction']>0
finally:
    server.shutdown()
    server.server_close()
    (OUT/'runtime-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
if any(x['status']=='failed' for x in report.values()): sys.exit(1)
