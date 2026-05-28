'use client';

import { useEffect, useMemo, useState } from 'react';
import { signOut } from 'next-auth/react';
import DeviceCard from './DeviceCard';

type User = {
  id?: string;
  name?: string | null;
  email?: string | null;
};

type DashboardClientProps = {
  user: User;
};

type HeartbeatData = {
  stationType: string;
  stationId: string;
  lastSeen: string;
  payload: any;
};

type SensorReadingData = {
  stationId: string;
  updatedAt: string;
  values: any;
};

type PumpStateData = {
  stationId: string;
  otaStatus?: string;
  control?: any;
  config?: any;
  updatedAt: string;
};

type SensorHistoryPoint = {
  timestamp: number;
  values: any;
};

const rawBrokerUrl = process.env.NEXT_PUBLIC_MQTT_BROKER_URL || 'ws://adro.ddns.net:9001';

function getBrokerUrl() {
  if (typeof window === 'undefined') {
    return rawBrokerUrl;
  }

  return window.location.protocol === 'https:'
    ? rawBrokerUrl.replace(/^ws:/i, 'wss:')
    : rawBrokerUrl;
}

function parsePayload(value: ArrayBuffer | string | Uint8Array): any {
  try {
    const raw = typeof value === 'string' ? value : new TextDecoder().decode(value);
    return JSON.parse(raw);
  } catch {
    return typeof value === 'string' ? value : new TextDecoder().decode(value);
  }
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [connectionState, setConnectionState] = useState('connecting');
  const [heartbeats, setHeartbeats] = useState<Record<string, HeartbeatData>>({});
  const [sensorReadings, setSensorReadings] = useState<Record<string, SensorReadingData>>({});
  const [sensorHistory, setSensorHistory] = useState<Record<string, SensorHistoryPoint[]>>({});
  const [pumpStates, setPumpStates] = useState<Record<string, PumpStateData>>({});
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const brokerUrl = getBrokerUrl();

  useEffect(() => {
    const savedState = localStorage.getItem('adro-dashboard-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setHeartbeats(parsed.heartbeats ?? {});
        setSensorReadings(parsed.sensorReadings ?? {});
        setSensorHistory(parsed.sensorHistory ?? {});
        setPumpStates(parsed.pumpStates ?? {});
      } catch {
        // ignore invalid cache
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'adro-dashboard-state',
      JSON.stringify({ heartbeats, sensorReadings, sensorHistory, pumpStates }),
    );
  }, [heartbeats, sensorReadings, sensorHistory, pumpStates]);

  useEffect(() => {
    let client: any;
    let isMounted = true;

    async function initializeMqtt() {
      const importedMqtt = await import('mqtt');
      const mqttModule = (importedMqtt as any).default ?? importedMqtt;
      const mqtt = typeof mqttModule === 'function' ? { connect: mqttModule } : mqttModule;
      const brokerUrl = getBrokerUrl();

      if (typeof mqtt.connect !== 'function') {
        throw new Error('Unable to load MQTT browser client; connect is not a function.');
      }

      const username = process.env.NEXT_PUBLIC_MQTT_USERNAME;
      const password = process.env.NEXT_PUBLIC_MQTT_PASSWORD;

      console.debug('MQTT connect', { brokerUrl, username, passwordPresent: Boolean(password) });
      client = mqtt.connect(brokerUrl, {
        reconnectPeriod: 5000,
        connectTimeout: 30_000,
        clean: true,
        username,
        password,
      });

      client.on('connect', (connAck: any) => {
        console.debug('MQTT connected', { connAck });
        if (!isMounted) return;
        setConnectionState('connected');
        setStatusLog((logs) => [`Connected to MQTT broker at ${brokerUrl}`, ...logs].slice(0, 10));
        client.subscribe('farmLab/+/+/heartbeat');
        client.subscribe('farmLab/sensorStations/+/Log/SensorReadings');
        client.subscribe('farmLab/pumpStations/+/ota_status');
        client.subscribe('farmLab/pumpStations/+/control');
        client.subscribe('farmLab/pumpStations/+/config');
      });

      client.on('reconnect', () => {
        if (!isMounted) return;
        setConnectionState('reconnecting');
        setStatusLog((logs) => ['MQTT reconnecting...', ...logs].slice(0, 10));
      });

      client.on('offline', () => {
        console.debug('MQTT offline');
        if (!isMounted) return;
        setStatusLog((logs) => ['MQTT offline', ...logs].slice(0, 10));
      });

      client.on('close', () => {
        console.debug('MQTT close');
        if (!isMounted) return;
        setStatusLog((logs) => ['MQTT connection closed', ...logs].slice(0, 10));
      });

      client.on('error', (error: Error) => {
        console.error('MQTT error', error);
        if (!isMounted) return;
        setConnectionState('error');
        setStatusLog((logs) => [`MQTT error: ${error.message}`, ...logs].slice(0, 10));
      });

      client.on('message', (topic: string, payload: ArrayBuffer | string | Uint8Array) => {
        if (!isMounted) return;
        const data = parsePayload(payload);
        const parts = topic.split('/');

        if (parts[0] !== 'farmLab') {
          return;
        }

        if (parts[3] === 'heartbeat') {
          const key = `${parts[1]}-${parts[2]}`;
          setHeartbeats((prev) => ({
            ...prev,
            [key]: {
              stationType: parts[1],
              stationId: parts[2],
              lastSeen: new Date().toISOString(),
              payload: data,
            },
          }));
        }

        if (parts[1] === 'sensorStations' && parts[3] === 'Log' && parts[4] === 'SensorReadings') {
          const key = parts[2];
          const now = Date.now();
          setSensorReadings((prev) => ({
            ...prev,
            [key]: {
              stationId: parts[2],
              updatedAt: new Date(now).toISOString(),
              values: data,
            },
          }));
          setSensorHistory((prev) => {
            const existing = prev[key] ?? [];
            const next = [...existing, { timestamp: now, values: data }]
              .filter((point) => point.timestamp >= now - 48 * 60 * 60 * 1000);
            return {
              ...prev,
              [key]: next,
            };
          });
        }

        if (parts[1] === 'pumpStations') {
          const key = parts[2];
          setPumpStates((prev) => ({
            ...prev,
            [key]: {
              stationId: parts[2],
              updatedAt: new Date().toISOString(),
              otaStatus: parts[3] === 'ota_status' ? data : prev[key]?.otaStatus,
              control: parts[3] === 'control' ? data : prev[key]?.control,
              config: parts[3] === 'config' ? data : prev[key]?.config,
            },
          }));
        }
      });
    }

    initializeMqtt();

    return () => {
      isMounted = false;
      if (client) {
        client.end(true);
      }
    };
  }, []);

  const activePumpCount = useMemo(() => Object.keys(pumpStates).length, [pumpStates]);
  const activeSensorCount = useMemo(() => Object.keys(sensorReadings).length, [sensorReadings]);
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
  const stationIds = useMemo(() => Object.keys(sensorReadings), [sensorReadings]);

  useEffect(() => {
    if (!selectedStationId && stationIds.length) {
      setSelectedStationId(stationIds[0]);
    }
  }, [stationIds, selectedStationId]);

  const selectedStation = selectedStationId ? sensorReadings[selectedStationId] : undefined;
  const selectedHistory = selectedStationId ? sensorHistory[selectedStationId] : [];
  const selectedHeartbeat = selectedStationId ? heartbeats[`sensorStations-${selectedStationId}`] : undefined;

  return (
    <section className="grid" style={{ gap: '1.5rem' }}>
      <div className="card dashboard-header">
        <div>
          <div className="eyebrow">Live status</div>
          <h2>Welcome, {user.name || user.email}</h2>
          <p className="meta-text">Quick overview of your connected stations, current broker connection, and recent activity.</p>
          <p className="status-pill online" style={{ marginTop: '1rem' }}>Broker: {brokerUrl}</p>
        </div>

        <div className="dashboard-actions">
          <p className={`status-pill ${connectionState === 'connected' ? 'online' : connectionState === 'error' ? 'offline' : ''}`}>
            {connectionState}
          </p>
          <button className="button secondary" onClick={() => signOut({ callbackUrl: '/login' })}>
            Sign out
          </button>
        </div>
      </div>

      <div className="grid responsive-grid">
        <div className="card summary-card">
          <h3 className="section-title">Station totals</h3>
          <ul className="info-list">
            <li>Sensor stations: {activeSensorCount}</li>
            <li>Pump stations: {activePumpCount}</li>
            <li>Broker: {brokerUrl}</li>
          </ul>
        </div>

        <div className="card summary-card">
          <h3 className="section-title">Recent activity</h3>
          <div className="code-block" style={{ minHeight: 140 }}>
            {statusLog.length ? statusLog.map((line, index) => <div key={index}>{line}</div>) : <div>No events yet.</div>}
          </div>
        </div>
      </div>

      <div className="grid responsive-grid">
        <div className="card station-panel">
          <h3 className="section-title">Connected stations</h3>
          {stationIds.length === 0 ? (
            <p>No sensor stations connected yet.</p>
          ) : (
            <div className="station-list">
              {stationIds.map((stationId) => (
                <button
                  key={stationId}
                  type="button"
                  className={`station-item ${stationId === selectedStationId ? 'active' : ''}`}
                  onClick={() => setSelectedStationId(stationId)}
                >
                  <span>{stationId}</span>
                  <span>{new Date(sensorReadings[stationId].updatedAt).toLocaleTimeString()}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="card station-detail">
          <h3 className="section-title">Selected station</h3>
          {selectedStation ? (
            <DeviceCard
              title={`Sensor station ${selectedStation.stationId}`}
              subtitle={`Updated ${new Date(selectedStation.updatedAt).toLocaleTimeString()}`}
              data={selectedStation.values}
              history={selectedHistory}
            />
          ) : (
            <p>Select a station to see details.</p>
          )}
          {selectedHeartbeat ? (
            <div className="device-detail">
              <div className="device-row">
                <span className="device-key">Last heartbeat</span>
                <span className="device-value">{new Date(selectedHeartbeat.lastSeen).toLocaleTimeString()}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Pump station details</h3>
        {Object.keys(pumpStates).length === 0 ? (
          <p>No pump station status data received yet.</p>
        ) : (
          Object.values(pumpStates).map((pump) => (
            <DeviceCard
              key={pump.stationId}
              title={`Pump station ${pump.stationId}`}
              subtitle={`Updated ${new Date(pump.updatedAt).toLocaleTimeString()}`}
              data={{ otaStatus: pump.otaStatus, control: pump.control, config: pump.config }}
            />
          ))
        )}
      </div>
    </section>
  );
}
