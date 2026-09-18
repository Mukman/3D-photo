export async function GET() {
  return Response.json({ error: "Album id is required" }, { status: 400 });
}
