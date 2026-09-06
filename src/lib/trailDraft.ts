import type { Child, Fact, Lesson } from '../types';
export type TrailDraft = {
  sessionId?: string; startedAt?: number;
  version: 1; lessonId: string; priorSessionId: string | null;
  facts: Fact[]; outcomes: boolean[]; typed: string; phase: 'ask' | 'feedback';
  correction?: {steps:number; typed:string; open:boolean; done:boolean};
  correctedFacts?: string[];
  elapsed: number; askedAt: number; responseMs: number[];
};
const key = (childId: string, lessonId: string) => `sumtrail.trail.v1.${childId}.${lessonId}`;
export const lastSession = (child: Child, lessonId: string) => child.sessions.filter(s => s.lessonId === lessonId).at(-1)?.id ?? null;
export function readDraft(child: Child, lesson: Lesson): TrailDraft | null {
  try {
    const d = JSON.parse(localStorage.getItem(key(child.id, lesson.id)) || 'null') as TrailDraft;
    if (!d || d.version !== 1 || d.lessonId !== lesson.id || d.priorSessionId !== lastSession(child, lesson.id)) return null;
    if (!Array.isArray(d.facts) || d.facts.length !== lesson.questionCount || !d.facts.every(f =>
      f && typeof f.id === 'string' && typeof f.prompt === 'string' && typeof f.tip === 'string' &&
      ['add','sub','mul','div'].includes(f.op) && [f.a,f.b,f.answer].every(n => Number.isInteger(n) && n >= 0) &&
      f.answer === (f.op === 'add' ? f.a + f.b : f.op === 'sub' ? f.a - f.b : f.op === 'mul' ? f.a * f.b : f.a / f.b))) return null;
    if (!Array.isArray(d.outcomes) || !d.outcomes.every(v => typeof v === 'boolean') ||
      !['ask','feedback'].includes(d.phase) || d.outcomes.length > d.facts.length ||
      (d.phase === 'feedback' ? d.outcomes.length === 0 : d.outcomes.length === d.facts.length)) return null;
    if (typeof d.typed !== 'string' || !/^\d{0,4}$/.test(d.typed) ||
      !Number.isFinite(d.elapsed) || d.elapsed < 0 || !Number.isFinite(d.askedAt) || d.askedAt < 0 || d.askedAt > d.elapsed ||
      !Array.isArray(d.responseMs) || d.responseMs.length !== d.outcomes.filter(Boolean).length ||
      !d.responseMs.every(n => Number.isFinite(n) && n >= 0 && n <= d.elapsed)) return null;
    if (d.sessionId !== undefined && typeof d.sessionId !== "string") return null;
    if (d.startedAt !== undefined && (!Number.isFinite(d.startedAt) || d.startedAt < 0)) return null;
    if (d.correctedFacts !== undefined && (!Array.isArray(d.correctedFacts) || !d.correctedFacts.every(id => typeof id === 'string' && d.facts.some(f => f.id === id)))) return null;
    if (d.correction !== undefined && (!Number.isInteger(d.correction.steps) || d.correction.steps < 0 || d.correction.steps > 144 || typeof d.correction.typed !== 'string' || !/^\d{0,4}$/.test(d.correction.typed) || typeof d.correction.open !== 'boolean' || typeof d.correction.done !== 'boolean')) return null;
    return d;
  } catch { return null; }
}
export function saveDraft(childId: string, draft: TrailDraft): boolean {
  try { localStorage.setItem(key(childId, draft.lessonId), JSON.stringify(draft)); return true; }
  catch { return false; }
}
export function clearDraft(childId: string, lessonId: string) {
  try { localStorage.removeItem(key(childId, lessonId)); } catch { /* Completed session also invalidates this draft. */ }
}
