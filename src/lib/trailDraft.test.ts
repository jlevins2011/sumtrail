// @vitest-environment jsdom
import { beforeEach, expect, it } from 'vitest';
import { createChild } from './storage';
import { LESSONS } from '../data/curriculum';
import { buildRound } from './facts';
import { readDraft, saveDraft, clearDraft, type TrailDraft } from './trailDraft';
const child = createChild('Scout','ember');
const lesson = LESSONS[0];
const draft: TrailDraft = {version:1, lessonId:lesson.id, priorSessionId:null, facts:buildRound(lesson.bank,lesson.questionCount), outcomes:[false,true],typed:'2',phase:'feedback',elapsed:4500,askedAt:3000,responseMs:[1500]};
beforeEach(()=>localStorage.clear());
it('round-trips the deck, mistakes and active timing independently for each student and trail',()=>{
  expect(saveDraft(child.id,draft)).toBe(true);
  expect(readDraft(child,lesson)).toEqual(draft);
  expect(readDraft({...child,id:'another-child'},lesson)).toBeNull();
  expect(readDraft(child,LESSONS[1])).toBeNull();
  clearDraft(child.id,lesson.id);
  expect(readDraft(child,lesson)).toBeNull();
});
it('rejects corrupt, incompatible and impossible snapshots',()=>{
  for(const change of [{elapsed:-1},{askedAt:9000},{outcomes:[]},{phase:'ask',outcomes:Array(draft.facts.length).fill(true)},{responseMs:[-1]},{facts:[{...draft.facts[0],answer:9999}]}]){
    saveDraft(child.id,{...draft,...change} as TrailDraft);
    expect(readDraft(child,lesson)).toBeNull();
  }
  localStorage.setItem(`sumtrail.trail.v1.${child.id}.${lesson.id}`,'broken');
  expect(readDraft(child,lesson)).toBeNull();
});
it('ignores a stale draft after its lesson has a newer completed session',()=>{
  saveDraft(child.id,draft);
  const completed={...child,sessions:[{id:'finished',lessonId:lesson.id}] as typeof child.sessions};
  expect(readDraft(completed,lesson)).toBeNull();
});
