import { availableLanterns, LANTERNS } from "../lib/keepsakes";
import { BridgeJourney } from "./BridgeJourney";
import { getLesson, getWorld, lessonsInWorld } from "../data/curriculum";
import { visibleWorlds } from "../lib/demo";
import { childStartWorldId, describeStartLevel } from "../lib/startLevel";
import { isLessonUnlocked, maxStars, progressPercent, recommendedLessonId, totalStars } from "../lib/stats";
import { useActiveChild, useDemoFlag, useStore } from "../store/StoreContext";
import { readDraft } from "../lib/trailDraft";
import { Pip } from "./Pip";

export function TrailMap() {
  const { dispatch } = useStore();
  const child = useActiveChild();
  const demo = useDemoFlag();
  if (!child) return null;
  const rec = recommendedLessonId(child, demo);
  const worlds = visibleWorlds(demo);
  const startWorld = childStartWorldId(child);
  const firstTrail = getLesson(rec)!;
  const startingCamp = getWorld(firstTrail.worldId)!;

  return (
    <div className="screen map-screen">
      <header className="map-top">
        <button className="text-back" onClick={() => dispatch({ type: "go", view: { name: "profiles" } })}>
          ← Explorers
        </button>
        <div className="map-who">
          <Pip coat={child.coat} pose="idle" size={64} />
          <div>
            <h1>{child.name}’s camps</h1>
            <p>
              {demo ? "Demo starts in Ember Grove" : `Starts at ${describeStartLevel(child)}`}
              {demo ? " · demo keeps later camps folded" : ""}
              {" · "}
              {progressPercent(child, demo)}% lit · {totalStars(child)}/{maxStars(demo)} stars · {child.journal.length}{" "}
              journal tips
            </p>
          </div>
        </div>
        <div className="map-actions">
          <button className="btn primary" onClick={() => dispatch({ type: "go", view: { name: "lesson", lessonId: rec } })}>
            Continue
          </button>
          <button className="btn ghost" onClick={() => dispatch({ type: "go", view: { name: "journal" } })}>
            Journal
          </button>
          <button className="btn ghost" onClick={() => dispatch({ type: "go", view: { name: "settings" } })}>
            Settings
          </button>
        </div>
      </header>

      {demo && <p className="demo-banner">Demo: Ember Grove’s four trails and its addition/subtraction workshop. Later camps are outside this demo.</p>}
      {child.sessions.length === 0 && <section className="panel first-session" aria-label="Your first adventure">
        <p className="eyebrow">YOUR FIRST ADVENTURE · {startingCamp.name}</p>
        <h2>Light your first {firstTrail.questionCount} lanterns.</h2>
        <p>Start with <strong>{firstTrail.title}</strong>. Each correct answer lights a lantern and carries Pip toward camp. Mistakes show you a helpful correction; you can always keep going.</p>
        <p>Pass trails to open the next one. Clear this camp’s campfire trail to earn a lantern glow you can use. The kind lantern never runs out of turns — no rush.</p>
        <div className="row-actions"><button className="btn primary" onClick={()=>dispatch({type:'go',view:{name:'lesson',lessonId:rec}})}>Start my first trail</button><button className="btn model-reset" onClick={()=>dispatch({type:'go',view:{name:'workshop',worldId:firstTrail.worldId}})}>Explore the workshop first</button></div>
        <small>Workshops let you build and move the math, without a timer or score.</small>
      </section>}

      <section className="camp-overview">
        <div><p className="eyebrow">YOUR CAMP, ONE DISCOVERY AT A TIME</p><h2>The lantern keepers’ trail</h2><p>Explore a workshop, walk a trail, and earn a new glow at each campfire.</p></div>
        <div className="keepsake-row" aria-label="Choose your lantern glow">{LANTERNS.map(l=>{
          const unlocked=availableLanterns(child).some(k=>k.id===l.id);
          return <button key={l.id} className="keepsake" aria-pressed={(child.lanternStyle??'amber')===l.id} disabled={!unlocked} onClick={()=>dispatch({type:'set-lantern',id:child.id,lanternStyle:l.id})}><i style={{background:l.color}}/><span>{l.name}</span><small>{unlocked?'Use on trails':'Clear its campfire'}</small></button>;
        })}</div>
      </section>
      <div className="worlds">
        {worlds.map((world) => {
          const lessons = lessonsInWorld(world.id);
          return (
            <section key={world.id} className={`world mood-${world.mood}`}>
              <header>
                <h2>
                  {world.name}
                  {!demo && world.id === startWorld ? " · starting camp" : ""}
                </h2>
                <p>{world.subtitle}</p>
                <div className="camp-progress"><span>{lessons.filter(l=>(child.completedLessons[l.id]?.stars??0)>0).length} / {lessons.length} trails lit</span><span>{child.campsCleared.includes(world.id)?'✦ Campfire earned':'Campfire ahead'}</span></div>
                <BridgeJourney coat={child.coat} mood={world.mood} total={lessons.length} outcomes={lessons.filter(l=>(child.completedLessons[l.id]?.stars??0)>0).map(()=>true)} lanternStyle={child.lanternStyle}/>
                <button className="btn workshop-link" onClick={()=>dispatch({type:'go',view:{name:'workshop',worldId:world.id}})}>Visit the field workshop</button>
              </header>
              <ol className="nodes">
                {lessons.map((lesson) => {
                  const record = child.completedLessons[lesson.id];
                  const unlocked = isLessonUnlocked(child, lesson.id, demo);
                  const stars = record?.stars ?? 0;
                  const draft = unlocked ? readDraft(child, lesson) : null;
                  return (
                    <li key={lesson.id}>
                      <button
                        className={`node ${unlocked ? "is-open" : "is-locked"} ${rec === lesson.id ? "is-next" : ""} ${stars ? "is-done" : ""}`}
                        disabled={!unlocked}
                        onClick={() => dispatch({ type: "go", view: { name: "lesson", lessonId: lesson.id } })}
                      >
                        <span className="node-num">{lesson.number}</span>
                        <span className="node-title">{lesson.title}</span>
                        <span className="node-tease">{draft ? `Resume · ${draft.outcomes.length}/${draft.facts.length} answered` : unlocked ? lesson.tease : "Locked"}</span>
                        <span className="node-stars">
                          {stars ? "★".repeat(stars) + "☆".repeat(3 - stars) : unlocked ? "☆☆☆" : "🔒"}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
