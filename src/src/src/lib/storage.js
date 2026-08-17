const PREFIX = "lengila:";
function read() {
  try { const raw = localStorage.getItem(PREFIX + "kv"); return raw ? JSON.parse(raw) : {}; }
  catch { return {}; }
}
function write(obj) { localStorage.setItem(PREFIX + "kv", JSON.stringify(obj)); }

export const storage = {
  async get(key) {
    const all = read();
    if (!(key in all)) return null;
    return { key, value: all[key] };
  },
  async set(key, value) {
    const all = read(); all[key] = value; write(all);
    return { key, value };
  },
  async delete(key) {
    const all = read(); const existed = key in all;
    delete all[key]; write(all);
    return { key, deleted: existed };
  },
  async list(prefix = "") {
    const all = read();
    return { keys: Object.keys(all).filter((k) => k.startsWith(prefix)) };
  },
};
if (typeof window !== "undefined") window.storage = storage;
