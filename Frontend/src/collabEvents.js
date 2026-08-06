export function createDesignUpdateEvent({ nodeId, actor, value, source = 'human', revision = 1 }) {
  return {
    type: 'design-update',
    nodeId,
    actor,
    value,
    source,
    revision,
    timestamp: Date.now()
  };
}

export function applyDesignUpdate(state, event) {
  const currentNode = state.nodes[event.nodeId] ?? {
    id: event.nodeId,
    content: '',
    revision: 0,
    lastActor: 'system',
    lastSource: 'system'
  };

  const nextRevision = Math.max(currentNode.revision + 1, event.revision ?? currentNode.revision + 1);

  if (event.revision && event.revision < currentNode.revision) {
    return state;
  }

  return {
    ...state,
    nodes: {
      ...state.nodes,
      [event.nodeId]: {
        id: event.nodeId,
        content: event.value,
        revision: nextRevision,
        lastActor: event.actor,
        lastSource: event.source
      }
    },
    lastEvent: event
  };
}
