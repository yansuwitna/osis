import { NextRequest } from "next/server";
import { voteEmitter } from "@/lib/events";
import { getElectionStats } from "@/lib/actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // 1. Kirim data awal begitu browser terhubung ke SSE
      try {
        const initialStats = await getElectionStats();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialStats)}\n\n`));
      } catch (err) {
        console.error("Gagal mengirim payload awal SSE:", err);
      }

      // 2. Event Listener: Dijalankan seketika saat ada pemilih mencoblos
      const onVoteUpdate = async () => {
        try {
          const freshStats = await getElectionStats();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(freshStats)}\n\n`));
        } catch (err) {
          console.error("Gagal menembakkan data SSE push:", err);
        }
      };

      voteEmitter.on("vote_update", onVoteUpdate);

      // 3. Heartbeat berkala (tiap 15 detik) untuk menjaga koneksi TCP / proxy tetap aktif
      const heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeatTimer);
        }
      }, 15000);

      // 4. Bersihkan listener saat tab browser ditutup
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
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
