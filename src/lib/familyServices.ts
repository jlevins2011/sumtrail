import { resolveStartLevel } from "./startLevel";
import type { Child, Session } from '../types';
/** Export-only boundary. Installation is trusted application bootstrap, never URL input. */
export type FamilyIdentityProvider = { studentId(localChildId:string):string | null };
let provider: FamilyIdentityProvider | null = null;
export function installFamilyIdentityProvider(next:FamilyIdentityProvider | null) { provider=next; }
export function learningReceipt(session:Session) {
  return {
    schemaVersion:1 as const,
    eventId:`sumtrail:${session.id}`,
    source:'sumtrail' as const,
    curriculumRevision:'sumtrail-facts-1',
    localStudentId:session.childId,
    studentId:provider?.studentId(session.childId) ?? null,
    lessonId:session.lessonId,
    startedAt:session.startedAt,
    activeDurationMs:session.durationMs,
    evidence:{independentCorrect:session.correct,independentErrors:session.errors,accuracy:session.accuracy,
      operationCorrect:session.operationCorrect,operationErrors:session.operationErrors,
      correctedFacts:session.correctedFacts ?? [],passed:session.passed,stars:session.stars},
    verification:'browser-local-unverified' as const,
  };
}
export function familyExport(child:Child) {
  return {schemaVersion:1,source:'sumtrail',exportedAt:new Date().toISOString(),
    student:{localId:child.id,studentId:provider?.studentId(child.id) ?? null,name:child.name,startingPractice:resolveStartLevel(child).label,startingCamp:resolveStartLevel(child).campId},
    receipts:child.sessions.map(learningReceipt)};
}
