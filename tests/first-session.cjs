const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const path=require('node:path'),os=require('node:os');
const base=process.env.SUMTRAIL_TEST_URL||'http://127.0.0.1:5178/sumtrail/';
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try {
 for(const demo of [false,true]) {
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
  const page=await context.newPage();page.setDefaultTimeout(10000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const target=new URL(base);if(demo)target.searchParams.set('demo','1');
  await page.goto(target.href);
  if(demo){await page.getByText('Demo: four trails and a workshop in Ember Grove').waitFor();assert.equal(await page.getByText('Hands-on workshops for all four operations').count(),0);}
  await page.getByRole('button',{name:'Start adventure',exact:true}).click();
  await page.getByLabel('First name').fill('First Scout');
  if(demo) await page.locator('.start-level-pick').last().click();
  await page.getByRole('button',{name:'Let’s go',exact:true}).click();
  await page.getByRole('heading',{name:'Light your first 6 lanterns.'}).waitFor();
  if(demo)assert.equal(await page.locator('.world').count(),1);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(os.tmpdir(),`sumtrail-first-map-${demo}.png`),fullPage:false});
  await page.getByRole('button',{name:'Start my first trail'}).click();
  await page.getByRole('button',{name:'Start trail',exact:true}).click();
  const facts=[];
  while(await page.locator('.fact-prompt').count()) {
   const prompt=await page.locator('.fact-prompt').textContent();const [a,,b]=prompt.trim().split(/\s+/);
   assert(+a>0&&+b>0);facts.push([+a,+b].sort().join('-'));
   for(const d of String(+a + +b))await page.getByRole('button',{name:d,exact:true}).click();
   await page.getByRole('button',{name:'Check answer'}).click();
   await page.getByRole('button',{name:/Next lantern|See camp stars/}).click();
  }
  assert.equal(facts.length,6);assert.equal(new Set(facts).size,6);
  await page.getByRole('heading',{name:'Your first trail is lit!'}).waitFor();
  await page.getByRole('region',{name:'Your next adventure'}).getByText('Friendly tens',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Practice in the workshop',exact:true}).click();
  await page.getByRole('button',{name:'Bring one stone'}).click();
  await page.getByRole('button',{name:'Bring one stone'}).click();
  await page.getByRole('button',{name:'Bring one stone'}).click();
  await page.getByRole('button',{name:'Built!',exact:true}).waitFor();
  await page.getByRole('button',{name:'Ready for a trail: Friendly tens'}).click();
  await page.getByRole('heading',{name:'Friendly tens',exact:true}).waitFor();
  await page.getByRole('button',{name:'Start trail',exact:true}).click();
  let count=0;
  while(await page.locator('.fact-prompt').count()) {
   const [a,,b]=(await page.locator('.fact-prompt').textContent()).trim().split(/\s+/);
   for(const d of String(+a + +b))await page.getByRole('button',{name:d,exact:true}).click();
   await page.getByRole('button',{name:'Check answer'}).click();
   await page.getByRole('button',{name:/Next lantern|See camp stars/}).click();count++;
  }
  assert.equal(count,8);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('sumtrail.v1')));
  assert.deepEqual(saved.children[0].sessions.map(s=>s.lessonId),['ember-meet','ember-add']);
  await page.getByRole('button',{name:'Next trail',exact:true}).click();
  await page.getByRole('heading',{name:'Take-away ferns',exact:true}).waitFor();
  await page.getByRole('button',{name:'← Camps',exact:true}).click();
  await page.getByRole('button',{name:'← Explorers',exact:true}).click();
  await page.getByRole('button',{name:/Add explorer/}).click();
  await page.getByLabel('First name').fill('Second Scout');
  await page.getByRole('button',{name:'Let’s go',exact:true}).click();
  await page.getByRole('heading',{name:'Light your first 6 lanterns.'}).waitFor();
  const profiles=await page.evaluate(()=>JSON.parse(localStorage.getItem('sumtrail.v1')).children);
  assert.equal(profiles.length,2);assert.equal(profiles[0].sessions.length,2);assert.equal(profiles[1].sessions.length,0);
  if(demo)assert.equal(new URL(page.url()).searchParams.get('demo'),'1');
  assert.deepEqual(errors,[]);await context.close();
 }
 console.log('PASS: fresh full/demo explorers, non-padding first round, first win, hands-on workshop, second/third trail continuation, profile isolation, mobile.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
