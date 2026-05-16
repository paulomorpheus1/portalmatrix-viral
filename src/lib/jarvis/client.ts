export async function queryJarvis(payload: {
  query: string;
  module?: string;
}) {
  const res = await fetch(process.env.JARVIS_API_URL!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.JARVIS_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Jarvis Core error");
  }

  return res.json();
}
