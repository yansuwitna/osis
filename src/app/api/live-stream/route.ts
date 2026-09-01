import { NextRequest } from "next/server";
import { voteEmitter } from "@/lib/events";
import { getElectionStats } from "@/lib/actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 1. Kirim padding komentar 2KB untuk memecah buffer proxy (Cloudflare/Nginx/Corporate Proxy)
      controller.enqueue(encoder.encode(`: ${" ".repeat(2048)}\n\n`));

      // 2. Kirim data awal begitu browser terhubung ke SSE
      try {
        const initialStats = await getElectionStats();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialStats)}\n\n`));
      } catch (err) {
        console.error("Gagal mengirim payload awal SSE:", err);
      }

      // 3. Event Listener: Dijalankan seketika saat ada pemilih mencoblos
      const onVoteUpdate = async () => {
        try {
          const freshStats = await getElectionStats();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(freshStats)}\n\n`));
        } catch (err) {
          console.error("Gagal menembakkan data SSE push:", err);
        }
      };

      voteEmitter.on("vote_update", onVoteUpdate);

      // 4. Heartbeat berkala (tiap 10 detik) untuk menjaga koneksi Cloudflare/TCP tetap hidup
      const heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(heartbeatTimer);
        }
      }, 10000);

      // 5. Bersihkan listener saat tab browser ditutup
      req.signal.addEventListener("abort", () => {
        voteEmitter.off("vote_update", onVoteUpdate);
        clearInterval(heartbeatTimer);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform, no-store, must-revalidate",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
