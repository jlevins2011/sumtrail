import { expect,it } from 'vitest';
import { createChild } from './storage';
import { availableLanterns } from './keepsakes';
it('only cleared camps unlock usable lantern styles, including legacy clears',()=>{
  const child=createChild('Scout','ember','5+');
  expect(availableLanterns(child).map(l=>l.id)).toEqual(['amber']);
  child.campsCleared=['ember-grove','night-sum'];
  expect(availableLanterns(child).map(l=>l.id)).toEqual(['amber','grove','summit']);
});
