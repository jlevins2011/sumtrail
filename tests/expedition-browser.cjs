const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const os=require('node:os'),path=require('node:path'),fs=require('node:fs');
const url=process.env.SUMTRAIL_TEST_URL||'http://127.0.0.1:5176';
const answer=prompt=>{const [a,op,b]=prompt.trim().split(/\s+/);return op==='+'?+a + +b:op==='−'?+a - +b:op==='×'?+a * +b:+a / +b;};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:1000},reducedMotion:'reduce'});
  page.setDefaultTimeout(10000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(url);await page.getByRole('button',{name:'Start adventure',exact:true}).click();
  await page.getByLabel('First name').fill('River');
  await page.locator('.start-level-pick').last().click();
  await page.getByRole('button',{name:'Let’s go',exact:true}).click();
  const snapshot=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sumtrail.v1')));
  assert.equal((await snapshot()).children[0].gradeBand,'5+');
  // Explore every model in the mixed camp. No workshop action can grant stars or sessions.
  await page.locator('.world').last().getByRole('button',{name:'Visit the field workshop'}).click();
  for(const [tab,action,total] of [['Add stones','Bring one stone',7],['Send stones','Send one stone',5],['Plant rows','Plant one row',12],['Share berries','Share with every basket',4]]){
    await page.getByRole('button',{name:tab,exact:true}).click();
    while(await page.getByRole('button',{name:action,exact:true}).count()) await page.getByRole('button',{name:action,exact:true}).click();
    assert.match(await page.locator('.model-explanation').textContent(),new RegExp(`= ${total}\\.`));
    if(tab==='Share berries') {assert.equal(await page.locator('.model-group b').allTextContents().then(v=>v.join(',')),'4 each,4 each,4 each');await page.screenshot({path:path.join(os.tmpdir(),'sumtrail-workshop.png'),fullPage:true});}
    await page.getByRole('button',{name:'Reset model'}).click();
    await page.setViewportSize({width:390,height:844});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  }
  assert.equal((await snapshot()).children[0].sessions.length,0);
  await page.getByRole('button',{name:'← Camps',exact:true}).click();
  // Complete actual subtraction, multiplication and division rounds.
  for(const title of ['Take-away ferns','Skip-count clover','Fair shares']){
    await page.locator('.node').filter({hasText:title}).click();
    if(title==='Fair shares') {
      await page.getByText(/thinking glow fades gently over 30 seconds/).waitFor();
      await page.clock.install();
    }
    await page.getByRole('button',{name:'Start trail',exact:true}).click();
    if(title==='Fair shares') {
      await page.clock.fastForward(13000);
      const width=await page.locator('.kind-bar span').evaluate(el=>parseFloat(el.style.width));
      assert(width>45&&width<65,`Expected a still-lit division glow, got ${width}`);
      await page.getByRole('button',{name:'Pause',exact:true}).click();
      const frozen=await page.locator('.kind-bar span').getAttribute('style');
      await page.waitForTimeout(300);
      assert.equal(await page.locator('.kind-bar span').getAttribute('style'),frozen);
      await page.getByRole('button',{name:'Continue trail',exact:true}).click();
    }
    while(await page.locator('.fact-prompt').count()){
      const n=answer(await page.locator('.fact-prompt').textContent());
      for(const digit of String(n)) await page.getByRole('button',{name:digit,exact:true}).click();
      await page.getByRole('button',{name:'Check answer',exact:true}).click();
      await page.getByRole('button',{name:/Next lantern|See camp stars/}).click();
    }
    const data=await snapshot();assert.equal(data.children[0].sessions.at(-1).accuracy,100);
    await page.getByRole('button',{name:'Camps',exact:true}).click();
  }
  // A real campfire earns an applicable reward, without granting local cross-game money.
  await page.locator('.node').filter({hasText:'Grove campfire'}).click();
  await page.getByRole('button',{name:'Start trail',exact:true}).click();
  while(await page.locator('.fact-prompt').count()){
    const n=answer(await page.locator('.fact-prompt').textContent());
    for(const digit of String(n))await page.getByRole('button',{name:digit,exact:true}).click();
    await page.getByRole('button',{name:'Check answer'}).click();
    await page.getByRole('button',{name:/Next lantern|See camp stars/}).click();
  }
  await page.getByText(/Fern glow is available/).waitFor();
  assert.equal(await page.evaluate(()=>localStorage.getItem('foxtrail.credits.v1')),null);
  await page.getByRole('button',{name:'Camps',exact:true}).click();
  await page.locator('.keepsake').filter({hasText:'Fern glow'}).click();
  assert.equal((await snapshot()).children[0].lanternStyle,'grove');
  assert.match(await page.locator('.bridge-journey').first().getAttribute('style'),/a5efb0/);
  await page.setViewportSize({width:1280,height:1000});
  await page.screenshot({path:path.join(os.tmpdir(),'sumtrail-camps.png'),fullPage:true});
  await page.getByRole('button',{name:'Journal',exact:true}).click();
  await page.getByLabel('Operation', {exact:true}).selectOption('div');
  assert(await page.locator('.journal-card').count()>0);
  await page.getByRole('button',{name:'Build this fact'}).first().click();
  await page.locator('.journal-practice .encounter').waitFor();
  await page.getByLabel('Find a fact').fill('no matches expected');
  await page.getByText('No facts match these filters.').waitFor();
  await page.getByRole('button',{name:'← Camps',exact:true}).click();
  await page.getByRole('button',{name:'Settings',exact:true}).click();
  await page.getByLabel('Sounds',{exact:true}).uncheck();await page.getByLabel('High contrast').check();
  await page.getByRole('button',{name:'Parent reports',exact:true}).click();
  await page.getByLabel('PIN',{exact:true}).fill('2468');await page.getByLabel('Type it again').fill('2468');
  await page.getByRole('button',{name:'Save PIN',exact:true}).click();
  await page.getByRole('heading',{name:'Accuracy by operation',exact:true}).waitFor();
  const downloadPromise=page.waitForEvent('download');
  await page.getByRole('button',{name:'Export this child’s learning records'}).click();
  const download=await downloadPromise;
  const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));
  assert.equal(exported.receipts.length,4);
  assert(exported.receipts.every(r=>r.studentId===null&&r.verification==='browser-local-unverified'));
  assert.equal(new Set(exported.receipts.map(r=>r.eventId)).size,4);
  await page.reload();
  assert.equal((await snapshot()).children[0].lanternStyle,'grove');
  assert.equal((await snapshot()).settings.sound,false);
  assert.equal((await snapshot()).settings.highContrast,true);
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await page.context().setOffline(true);
  await page.reload();
  await page.getByRole('button',{name:'Play',exact:true}).waitFor();
  assert.equal((await snapshot()).children[0].sessions.length,4);
  await page.context().setOffline(false);
  assert.deepEqual(errors,[]);
  console.log('PASS: four workshops; three operation rounds; campfire reward; lantern use; journal; parent export; settings; narrow layout.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
