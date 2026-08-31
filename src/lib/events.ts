import { EventEmitter } from "events";

// Gunakan globalThis agar instance EventEmitter tetap konsisten dan tidak di-recreate saat hot reload
const globalForEvents = globalThis as unknown as {
  voteEmitter: EventEmitter | undefined;
};

export const voteEmitter =
  globalForEvents.voteEmitter ?? new EventEmitter();

// Tingkatkan batas maksimal listener agar mendukung banyak browser/layar SSE secara bersamaan
voteEmitter.setMaxListeners(1000);

if (process.env.NODE_ENV !== "production") {
  globalForEvents.voteEmitter = voteEmitter;
}

// Fungsi pembantu untuk memicu push broadcast ke seluruh koneksi SSE
export function notifyVoteUpdate() {
  try {
    voteEmitter.emit("vote_update");
  } catch (err) {
    console.error("Gagal memicu SSE broadcast event:", err);
  }
}
