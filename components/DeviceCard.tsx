type DeviceCardProps = {
  title: string;
  subtitle: string;
  data: any;
};

export default function DeviceCard({ title, subtitle, data }: DeviceCardProps) {
  const rows = typeof data === 'object' && data !== null ? Object.entries(data) : [];

  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <h4 style={{ margin: 0 }}>{title}</h4>
      <p style={{ margin: '0.4rem 0 1rem', color: '#94a3b8' }}>{subtitle}</p>
      {rows.length > 0 ? (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {rows.map(([key, value]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
              <span style={{ color: '#cbd5e1' }}>{key}</span>
              <span style={{ fontWeight: 600 }}>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ margin: 0, color: '#cbd5e1' }}>{data ?? 'No details available.'}</p>
      )}
    </div>
  );
}
