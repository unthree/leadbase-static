// Shape guards so a bad agent write (partial PUT, wrong keys) can't corrupt
// a store and crash the UI. Each store must contain these array fields.

const REQUIRED_ARRAYS = {
  tasks: ["lanes", "tasks"],
  ideas: ["boards"],
  newsletter: ["sources", "drafts", "runs"],
  research: ["history"],
  sponsors: ["prospects"]
};

export function isValidStore(name, value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const fields = REQUIRED_ARRAYS[name] || [];
  return fields.every((f) => Array.isArray(value[f]));
}
