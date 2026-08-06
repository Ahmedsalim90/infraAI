import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { createDesignUpdateEvent } from './collabEvents';

const SOCKET_URL = 'http://localhost:3001';

export function useCollabSocket(roomId = 'default-room') {
  const socketRef = useRef(null);
  const [state, setState] = useState({ nodes: {}, lastEvent: null });
  const [isConnected, setIsConnected] = useState(false);
  const [isRemoteTyping, setIsRemoteTyping] = useState(false);

  const socket = useMemo(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { transports: ['websocket'] });
    }
    return socketRef.current;
  }, []);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-room', roomId);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('design-update', (event) => {
      if (event?.type !== 'design-update') {
        return;
      }

      setState((current) => ({
        ...current,
        nodes: {
          ...current.nodes,
          [event.nodeId]: {
            id: event.nodeId,
            content: event.value,
            revision: event.revision ?? (current.nodes[event.nodeId]?.revision ?? 0) + 1,
            lastActor: event.actor,
            lastSource: event.source || 'human'
          }
        },
        lastEvent: event
      }));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('design-update');
    };
  }, [roomId, socket]);

  const emitDesignUpdate = ({ nodeId, actor, value, source = 'human', revision = 1 }) => {
    const event = createDesignUpdateEvent({ nodeId, actor, value, source, revision });
    socket.emit('design-update', { ...event, roomId });
  };

  const setTyping = (isTyping) => {
    setIsRemoteTyping(isTyping);
  };

  return { state, emitDesignUpdate, isConnected, isRemoteTyping, setTyping };
}
