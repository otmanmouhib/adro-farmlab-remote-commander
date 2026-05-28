import { useEffect, useMemo, useState } from 'react';

type SensorHistoryPoint = {
  timestamp: number;
  values: any;
};

type DeviceCardProps = {
  title: string;
  subtitle: string;
  data: any;
  history?: SensorHistoryPoint[];
};

function formatLabel(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getSensorMetricKeys(data: any): string[] {
  if (data?.sensors && typeof data.sensors === 'object') {
    return Object.keys(data.sensors);
  }
  return [];
}

function renderObject(object: any): React.ReactNode {
  if (Array.isArray(object)) {
    return (
      <div className="device-detail nested">
        {object.map((item, index) => (
          <div className="device-row" key={index}>
            <span className="device-key">Item {index + 1}</span>
            <span className="device-value">{typeof item === 'object' ? JSON.stringify(item) : String(item)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="device-detail nested">
      {Object.entries(object).map(([key, value]) =>
        typeof value === 'object' && value !== null ? (
          <div className="device-section" key={key}>
            <div className="device-section-title">{formatLabel(key)}</div>
            {renderObject(value)}
          </div>
        ) : (
          <div className="device-row" key={key}>
            <span className="device-key">{formatLabel(key)}</span>
            <span className="device-value">{String(value)}</span>
          </div>
        ),
      )}
    </div>
  );
}

function buildHistorySeries(history: SensorHistoryPoint[], metric: string) {
  return history
    .map((point) => {
      const raw = point.values?.sensors?.[metric];
      const value = typeof raw === 'number' ? raw : parseFloat(raw);
      return Number.isFinite(value) ? { timestamp: point.timestamp, value } : null;
    })
    .filter((item): item is { timestamp: number; value: number } => item !== null)
    .sort((a, b) => a.timestamp - b.timestamp);
}

function buildLinePath(points: { x: number; y: number }[]) {
  if (!points.length) {
    return '';
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
}

function HistoricalChart({ history, metric }: { history: SensorHistoryPoint[]; metric: string }) {
  const series = buildHistorySeries(history, metric);
  const width = 320;
  const height = 140;
  const padding = 16;

  if (series.length === 0) {
    return <p className="device-subtitle">Waiting for historical values...</p>;
  }

  const values = series.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = series.map((point, index) => {
    const x = padding + (index / Math.max(series.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((point.value - min) / span) * (height - padding * 2);
    return { x, y, value: point.value };
  });

  const path = buildLinePath(points);

  return (
    <div className="device-chart">
      <div className="chart-header">
        <span className="chart-title">{formatLabel(metric)} history (48h)</span>
        <span className="chart-summary">Latest: {points[points.length - 1].value.toFixed(2)}</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="chart-svg" aria-label={`Historical chart for ${metric}`}>
        <defs>
          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(56,189,248,0.9)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.12)" />
          </linearGradient>
        </defs>
        <path d={path} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d={`${path} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
          fill="url(#chartGradient)"
          opacity="0.35"
        />
        {points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="2.8" fill="#fff" stroke="#38bdf8" strokeWidth="1.5" />
        ))}
      </svg>
    </div>
  );
}

export default function DeviceCard({ title, subtitle, data, history }: DeviceCardProps) {
  const rows = typeof data === 'object' && data !== null ? Object.entries(data) : [];
  const sensorKeys = useMemo(() => getSensorMetricKeys(data), [data]);
  const [selectedMetric, setSelectedMetric] = useState<string | undefined>(sensorKeys[0]);

  useEffect(() => {
    if (sensorKeys.length && !sensorKeys.includes(selectedMetric ?? '')) {
      setSelectedMetric(sensorKeys[0]);
    }
  }, [sensorKeys, selectedMetric]);

  return (
    <div className="card device-card" style={{ marginBottom: '1rem' }}>
      <h4>{title}</h4>
      <p className="device-subtitle">{subtitle}</p>
      {rows.length > 0 ? (
        <div className="device-detail">
          {Object.entries(data).map(([key, value]) =>
            typeof value === 'object' && value !== null ? (
              <div className="device-section" key={key}>
                <div className="device-section-title">{formatLabel(key)}</div>
                {renderObject(value)}
              </div>
            ) : (
              <div className="device-row" key={key}>
                <span className="device-key">{formatLabel(key)}</span>
                <span className="device-value">{String(value)}</span>
              </div>
            ),
          )}
        </div>
      ) : (
        <p className="device-subtitle">{data ?? 'No details available.'}</p>
      )}

      {history && history.length > 0 && sensorKeys.length > 0 ? (
        <div className="device-detail device-chart-block">
          <div className="chart-controls">
            <label className="form-label" style={{ marginBottom: '0.5rem' }}>
              <span>Metric</span>
              <select
                className="input"
                value={selectedMetric}
                onChange={(event) => setSelectedMetric(event.target.value)}
              >
                {sensorKeys.map((key) => (
                  <option key={key} value={key}>
                    {formatLabel(key)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {selectedMetric ? <HistoricalChart history={history} metric={selectedMetric} /> : null}
        </div>
      ) : null}
    </div>
  );
}
