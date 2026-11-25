import { Client } from '../../.codex-tools/sources/BabylonJS--Spector.js/mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js';
import { StdioClientTransport } from '../../.codex-tools/sources/BabylonJS--Spector.js/mcp/node_modules/@modelcontextprotocol/sdk/dist/esm/client/stdio.js';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.join(root, '.codex-tools/validation');
await mkdir(out, { recursive: true });
const servers = JSON.parse(await readFile(path.join(root, '.codex-tools/mcp-servers.json'), 'utf8'));
const fixture = createServer(async (req, res) => {
  try {
    if (req.url === '/data.json') { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({message:'Network inspection passed'})); }
    else if (req.url === '/scene.js') { res.setHeader('Content-Type','text/javascript'); res.end(await readFile(path.join(root,'tools/codex-setup/fixtures/scene.js'))); }
    else if (req.url === '/favicon.ico') { res.writeHead(204); res.end(); }
    else { res.setHeader('Content-Type','text/html'); res.end(await readFile(path.join(root,'tools/codex-setup/fixtures/inspection.html'))); }
  } catch (err) { res.writeHead(500); res.end(String(err)); }
});
await new Promise(resolve => fixture.listen(0, '127.0.0.1', resolve));
const url = `http://127.0.0.1:${fixture.address().port}/`;
const targets = new Set(process.argv.slice(2));
const previous = targets.size ? JSON.parse(await readFile(path.join(out,'mcp-validation.json'),'utf8')) : {servers:{}};
const report = {...previous, timestamp:new Date().toISOString(), fixture:url};
function check(condition, message) { if (!condition) throw new Error(message); }
function txt(result) { return result.content?.filter(x=>x.type==='text').map(x=>x.text).join('\n') || ''; }
async function test(name, work) {
  if (targets.size && !targets.has(name)) return;
  const config = servers[name];
  const client = new Client({name:'codex-browser-validation',version:'1.0.0'});
  const transport = new StdioClientTransport({...config, env:{...process.env,...config.env}, stderr:'pipe'});
  const result = {status:'running', checks:[]}; report.servers[name] = result;
  let log = '';
  const call = async (tool, args={}) => {
    const response = await client.callTool({name:tool,arguments:args}, undefined, {timeout:120000});
    const clean = {...response, content:[]};
    for (const [i, block] of (response.content||[]).entries()) {
      if (block.type === 'image') {
        const target = `${name}-${tool}-${i}.png`;
        await writeFile(path.join(out,target), Buffer.from(block.data,'base64'));
        clean.content.push({type:'image',saved:target,mimeType:block.mimeType});
      } else { clean.content.push(block); }
    }
    await writeFile(path.join(out,`${name}-${tool}.json`),JSON.stringify(clean,null,2));
    check(!response.isError, `${tool}: ${txt(response)}`);
    result.checks.push(tool);
    console.log(name, tool, 'PASS');
    return response;
  };
  try {
    await client.connect(transport);
    transport.stderr?.on('data',data=>log+=data.toString());
    let tools=[], cursor;
    do { const page=await client.listTools(cursor?{cursor}:{}); tools.push(...page.tools); cursor=page.nextCursor; } while(cursor);
    result.toolCount=tools.length;
    await writeFile(path.join(out,`${name}-catalog.json`), JSON.stringify({tools},null,2));
    await work(call, tools);
    result.status='passed';
  } catch(error) { result.status='failed'; result.error=String(error); console.error(name,result.error); process.exitCode=1; }
  finally { await client.close(); await writeFile(path.join(out,`${name}-stderr.log`),log); }
}
try {
  await test('chrome-devtools',async call=>{
    const page=await call('new_page',{url:'https://example.com',isolatedContext:'setup-validation'});
    const pageId=Number(txt(page).match(/(?:^|\n)(\d+):[^\n]*https:\/\/example\.com/m)?.[1]);
    check(Number.isFinite(pageId),'Could not find created page ID: '+txt(page));
    const title=await call('evaluate_script',{pageId,function:'() => document.title'});
    check(txt(title).includes('Example Domain'),'Unexpected public test page');
    await call('take_screenshot',{pageId,filePath:path.join(out,'chrome-public.png')});
    await call('navigate_page',{pageId,url});
    const snap=await call('take_snapshot',{pageId});
    check(txt(snap).includes('Browser inspection validation'),'DOM snapshot missing fixture heading');
    const uid=txt(snap).match(/uid=([\w.-]+) button "Record click"/)?.[1];
    check(uid,'Missing button UID');
    await call('get_css_styles',{pageId,uid});
    await call('click',{pageId,uid});
    const computed=await call('evaluate_script',{pageId,function:'() => ({title:document.title,color:getComputedStyle(document.body).color,clicks:window.validation.clicks,network:window.validation.network,frames:window.validation.frames})'});
    check(txt(computed).includes('rgb(24, 36, 52)') && txt(computed).includes('Network inspection passed'),'Computed styles or network data incorrect');
    const network=await call('list_network_requests',{pageId});
    check(txt(network).includes('/data.json'),'Network request missing');
    const request=Number(txt(network).match(/reqid=(\d+).*\/data\.json/)?.[1]);
    check(Number.isFinite(request),'Missing request ID');
    const response=await call('get_network_request',{pageId,reqid:request});
    check(txt(response).includes('Network inspection passed'),'Could not inspect response body');
    await call('take_screenshot',{pageId,filePath:path.join(out,'chrome-fixture.png')});
    await call('list_console_messages',{pageId});
    await call('performance_start_trace',{pageId,reload:false,autoStop:false});
    await call('evaluate_script',{pageId,function:'() => document.querySelector("#action").getBoundingClientRect().width'});
    await call('performance_stop_trace',{pageId,filePath:path.join(out,'chrome-trace.json.gz')});
  });
  await test('agent-browser',async call=>{
    const session='codex-setup-validation';
    try {
      await call('agent_browser_open',{session,url:'https://example.com'});
      const title=await call('agent_browser_get_title',{session});
      check(txt(title).includes('Example Domain'),'Unexpected public page title');
      await call('agent_browser_screenshot',{session,path:path.join(out,'agent-public.png')});
      await call('agent_browser_open',{session,url});
      const snap=await call('agent_browser_snapshot',{session});
      check(txt(snap).includes('Browser inspection validation'),'Missing fixture DOM');
      await call('agent_browser_fill',{session,selector:'#entry',text:'Codex test'});
      await call('agent_browser_press',{session,key:'End'});
      await call('agent_browser_click',{session,selector:'#action'});
      const result=await call('agent_browser_eval',{session,script:'JSON.stringify({value:document.querySelector("#entry").value,clicks:window.validation.clicks,keys:window.validation.keys,network:window.validation.network,frames:window.validation.frames})'});
      check(txt(result).includes('Codex test') && txt(result).includes('Network inspection passed'),'Input or inspection failed');
      await call('agent_browser_scroll',{session,direction:'down',amount:500});
      await call('agent_browser_screenshot',{session,path:path.join(out,'agent-fixture.png')});
    } finally { await call('agent_browser_close',{session}); }
  });
  await test('spector',async call=>{
    await call('load_url',{url});
    const canvases=await call('list_canvases');
    check(txt(canvases).includes('webgl'),'No WebGL context detected');
    await call('select_canvas',{index:0});
    await call('get_context_info');
    const frame=await call('capture_frame',{quickCapture:false});
    check(/draw|command/i.test(txt(frame)),'Missing capture summary');
    const draws=await call('get_draw_calls');
    check(txt(draws).includes('drawArrays'),'No triangle draw call captured');
    const shaders=await call('get_shaders');
    check(txt(shaders).includes('gl_FragColor'),'Fragment source missing');
    const textures=await call('get_textures');
    check(/2/.test(txt(textures)),'Texture dimensions missing');
    await call('get_webgl_state');
    await call('get_console_logs');
    await call('take_screenshot');
  });
} finally {
  fixture.closeAllConnections();
  await new Promise(resolve=>fixture.close(resolve));
  await writeFile(path.join(out,'mcp-validation.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
}
