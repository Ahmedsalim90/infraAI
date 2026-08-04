import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export function useCollabSocket(projectId) {
  const socketRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [design, setDesign] = useState(null);
  const [version, setVersion] = useState(0);
  const [conflict, setConflict] = useState(null);

  useEffect(() => {
    if (!projectId) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("join_project", { project_id: projectId });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });
    socket.on("joined_project", (data) => {
        if (data.project_id === projectId) {
            setDesign(data.design);
            setVersion(data.version);
        }
    });

    socket.on("presence_update", (data) => {
      if (data.project_id === projectId) {
        setOnlineCount(data.online_count);
      }
    });

   
    socket.on("design_updated", (data) => {
      if (data.project_id === projectId) {
        setDesign(data.design);
        setVersion(data.version);
        setConflict(null);
      }
    });

    socket.on("design_conflict", (data) => {
      if (data.project_id === projectId) {
        setConflict({
          currentVersion: data.current_version,
          currentDesign: data.current_design
        });
        setDesign(data.current_design);
        setVersion(data.current_version);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [projectId]);

  const sendDesignUpdate = useCallback((newDesign) => {
    if (!socketRef.current) return;
    socketRef.current.emit("design_update", {
      project_id: projectId,
      version: version,
      design: newDesign
    });
  }, [projectId, version]);

  return {
    isConnected,
    onlineCount,
    design,
    version,
    conflict,
    sendDesignUpdate
  };
}