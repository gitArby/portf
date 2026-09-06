import { useState, useEffect, useRef } from 'react';
import { LanyardData } from '../types';

const DISCORD_ID = '938119246196666378';

export function useLanyard() {
  const [data, setData] = useState<LanyardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let reconnectAttempts = 0;
    const maxAttempts = 5;
    let isMounted = true;

    function connect() {
      if (reconnectAttempts >= maxAttempts) {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
        return;
      }

      try {
        const ws = new WebSocket('wss://api.lanyard.rest/socket');
        socketRef.current = ws;

        ws.onopen = () => {
          reconnectAttempts = 0;
        };

        ws.onmessage = (event) => {
          try {
            const { op, d } = JSON.parse(event.data);
            if (op === 1) {
              heartbeatRef.current = setInterval(() => {
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ op: 3 }));
                }
              }, d.heartbeat_interval);

              ws.send(
                JSON.stringify({
                  op: 2,
                  d: { subscribe_to_id: DISCORD_ID },
                })
              );
            } else if (op === 0) {
              if (isMounted) {
                setData(d);
                setLoading(false);
                setError(false);
              }
            }
          } catch (err) {
            console.error('Lanyard parsing error', err);
          }
        };

        ws.onerror = () => {
          // Handled in onclose
        };

        ws.onclose = () => {
          if (heartbeatRef.current) clearInterval(heartbeatRef.current);
          if (!isMounted) return;
          reconnectAttempts++;
          const timeout = Math.min(5000 * Math.pow(2, reconnectAttempts - 1), 30000);
          setTimeout(connect, timeout);
        };
      } catch (err) {
        console.error('WebSocket connection failed', err);
        if (isMounted) {
          reconnectAttempts++;
          setTimeout(connect, 5000);
        }
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (socketRef.current) socketRef.current.close();
    };
  }, []);

  return { data, loading, error };
}
