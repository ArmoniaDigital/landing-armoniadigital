export default function ResearchProof({ proof, className = "" }) {
  if (!proof) return null;

  return (
    <aside className={`research-proof ${className}`.trim()}>
      <strong>{proof.value}</strong>
      <p>{proof.text}</p>
      <span>Fuente: {proof.source}</span>
    </aside>
  );
}
