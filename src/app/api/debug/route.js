export async function POST(request) {
  try {
    const payload = await request.json();
    await fetch("http://127.0.0.1:7742/ingest/6df102a3-018b-4c90-a04c-3daa6827d6d1", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "ab7357",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
}
