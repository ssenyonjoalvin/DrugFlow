export default async function EditMedicinePage({ params }: { params: Promise<{ id: string }> }) {
  await params;
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-zinc-800">Edit Medicine</h2>
      <p className="mt-1 text-sm text-zinc-500">Edit medicine details. (Placeholder — form coming soon.)</p>
    </div>
  );
}
