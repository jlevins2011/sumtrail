import { expect,it } from 'vitest';
import { familyExport,installFamilyIdentityProvider,learningReceipt } from './familyServices';
import { createChild,emptyOperationTally } from './storage';
import type { Session } from '../types';
it('exports stable deduplicatable evidence without claiming shared identity or credit authorization',()=>{
  const child=createChild('Scout','ember');
  const s:Session={id:'event',childId:child.id,lessonId:'ember-meet',startedAt:100,durationMs:50,accuracy:83,correct:5,errors:1,factErrors:{'add-2-2':1},operationCorrect:{...emptyOperationTally(),add:5},operationErrors:{...emptyOperationTally(),add:1},stars:2,passed:true,factsFound:[],smoothness:.5,correctedFacts:['add-2-2']};
  child.sessions=[s];
  expect(learningReceipt(s).studentId).toBeNull();
  expect(learningReceipt(s).eventId).toBe(learningReceipt(s).eventId);
  expect(learningReceipt(s).evidence.independentCorrect).toBe(5);
  expect(familyExport(child).receipts[0].verification).toBe('browser-local-unverified');
  installFamilyIdentityProvider({studentId:id=>id===child.id?'shared-student':null});
  expect(learningReceipt(s).studentId).toBe('shared-student');
  installFamilyIdentityProvider(null);
});
