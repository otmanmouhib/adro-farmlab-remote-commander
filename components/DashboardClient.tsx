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

const brokerUrl =
  process.env.NEXT_PUBLIC_MQTT_BROKER_URL || 'ws://adro.ddns.net:9001';

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
  const [pumpStates, setPumpStates] = useState<Record<string, PumpStateData>>({});
  const [statusLog, setStatusLog] = useState<string[]>([]);

  useEffect(() => {
    const savedState = localStorage.getItem('adro-dashboard-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setHeartbeats(parsed.heartbeats ?? {});
        setSensorReadings(parsed.sensorReadings ?? {});
        setPumpStates(parsed.pumpStates ?? {});
      } catch {
        // ignore invalid cache
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'adro-dashboard-state',
      JSON.stringify({ heartbeats, sensorReadings, pumpStates }),
    );
  }, [heartbeats, sensorReadings, pumpStates]);

  useEffect(() => {
    let client: any;
    let isMounted = true;

    async function initializeMqtt() {
      const importedMqtt = await import('mqtt');
      const mqtt = (importedMqtt as any).default ?? importedMqtt;
      client = mqtt.connect(brokerUrl, {
        reconnectPeriod: 5000,
        connectTimeout: 30_000,
        clean: true,
      });

      client.on('connect', () => {
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
      });

      client.on('error', (error: Error) => {
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
          setSensorReadings((prev) => ({
            ...prev,
            [key]: {
              stationId: parts[2],
              updatedAt: new Date().toISOString(),
              values: data,
            },
          }));
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

  return (
    <section className="grid" style={{ gap: '1.5rem' }}>
      <div className="card header" style={{ gap: '1rem', alignItems: 'center' }}>
        <div>
          <p className="status-pill online">Broker: {brokerUrl}</p>
          <h2>Welcome, {user.name || user.email}</h2>
          <p>Connected devices: {activeSensorCount + activePumpCount}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <p className={`status-pill ${connectionState === 'connected' ? 'online' : connectionState === 'error' ? 'offline' : ''}`}>
            {connectionState}
          </p>
          <button className="button" onClick={() => signOut({ callbackUrl: '/login' })}>
            Sign out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3">
        <div className="card">
          <h3>Station totals</h3>
          <div className="status-pill online">Sensor stations: {activeSensorCount}</div>
          <div className="status-pill online">Pump stations: {activePumpCount}</div>
          <div className="status-pill online">Memory cache: stored locally</div>
        </div>

        <div className="card">
          <h3>Subscription topics</h3>
          <ul style={{ marginTop: '1rem', lineHeight: '1.75' }}>
            <li>farmLab/+/+/heartbeat</li>
            <li>farmLab/sensorStations/+/Log/SensorReadings</li>
            <li>farmLab/pumpStations/+/ota_status</li>
            <li>farmLab/pumpStations/+/control</li>
            <li>farmLab/pumpStations/+/config</li>
          </ul>
        </div>

        <div className="card">
          <h3>Recent activity</h3>
          <div className="code-block" style={{ minHeight: 140 }}>
            {statusLog.length ? statusLog.map((line, index) => <div key={index}>{line}</div>) : <div>No events yet.</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="card">
          <h3>Heartbeat summary</h3>
          {Object.keys(heartbeats).length === 0 ? (
            <p>No heartbeat messages received yet.</p>
          ) : (
            Object.values(heartbeats).map((heartbeat) => (
              <DeviceCard
                key={heartbeat.stationId}
                title={`${heartbeat.stationType} / ${heartbeat.stationId}`}
                subtitle={`Last seen ${new Date(heartbeat.lastSeen).toLocaleTimeString()}`}
                data={heartbeat.payload}
              />
            ))
          )}
        </div>

        <div className="card">
          <h3>Sensor readings</h3>
          {Object.keys(sensorReadings).length === 0 ? (
            <p>No sensor readings received yet.</p>
          ) : (
            Object.values(sensorReadings).map((reading) => (
              <DeviceCard
                key={reading.stationId}
                title={`Sensor station ${reading.stationId}`}
                subtitle={`Updated ${new Date(reading.updatedAt).toLocaleTimeString()}`}
                data={reading.values}
              />
            ))
          )}
        </div>
      </div>

      <div className="card">
        <h3>Pump station details</h3>
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
