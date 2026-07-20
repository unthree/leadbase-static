// Shape guards so a bad agent write (partial PUT, wrong keys, null elements)
// can't corrupt a store and crash the UI. Checks the top-level arrays AND the
// fields each page actually dereferences on every element.

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const str = (v) => typeof v === "string";

const CHECKS = {
  tasks: (v) =>
    Array.isArray(v.lanes) &&
    Array.isArray(v.tasks) &&
    v.lanes.every((l) => isObj(l) && str(l.id) && str(l.name)) &&
    v.tasks.every((t) => isObj(t) && str(t.id) && str(t.title) && str(t.lane)),
  ideas: (v) =>
    Array.isArray(v.boards) &&
    v.boards.every(
      (b) =>
        isObj(b) &&
        str(b.id) &&
        str(b.name) &&
        Array.isArray(b.ideas) &&
        b.ideas.every((i) => isObj(i) && str(i.id) && str(i.title))
    ),
  newsletter: (v) =>
    Array.isArray(v.sources) &&
    Array.isArray(v.drafts) &&
    Array.isArray(v.runs) &&
    v.sources.every((s) => isObj(s) && str(s.url)) &&
    v.drafts.every((d) => isObj(d) && str(d.title) && str(d.body)) &&
    v.runs.every(isObj),
  research: (v) =>
    Array.isArray(v.history) && v.history.every((h) => isObj(h) && str(h.topic)),
  sponsors: (v) =>
    Array.isArray(v.prospects) &&
    v.prospects.every((p) => isObj(p) && str(p.name))
};

export function isValidStore(name, value) {
  if (!isObj(value)) return false;
  const check = CHECKS[name];
  return check ? check(value) : false;
}
