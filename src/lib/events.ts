import { EventEmitter } from "events";

// Gunakan globalThis agar instance EventEmitter tetap sama persis di seluruh modul Next.js
// (Server Actions, API Route, dan Background Handlers) baik di mode Production maupun Development
const globalForEvents = globalThis as unknown as {
  voteEmitter?: EventEmitter;
};

if (!globalForEvents.voteEmitter) {
  globalForEvents.voteEmitter = new EventEmitter();
  // Tingkatkan batas maksimal listener agar mendukung banyak browser/layar SSE secara bersamaan
  globalForEvents.voteEmitter.setMaxListeners(1000);
}

export const voteEmitter = globalForEvents.voteEmitter;

// Fungsi pembantu untuk memicu push broadcast ke seluruh koneksi SSE
export function notifyVoteUpdate() {
  try {
    voteEmitter.emit("vote_update");
  } catch (err) {
    console.error("Gagal memicu SSE broadcast event:", err);
  }
}

