import { createDesignUpdateEvent, applyDesignUpdate } from './collabEvents';

const initialState = { nodes: {}, lastEvent: null };

const humanEvent = createDesignUpdateEvent({ nodeId: 'node-1', actor: 'user-a', value: 'A', source: 'human', revision: 1 });
const aiEvent = createDesignUpdateEvent({ nodeId: 'node-1', actor: 'ai-agent', value: 'A+', source: 'ai', revision: 2 });

const afterHuman = applyDesignUpdate(initialState, humanEvent);
const afterAi = applyDesignUpdate(afterHuman, aiEvent);

if (afterHuman.nodes['node-1'].content !== 'A') {
  throw new Error('Human update did not apply correctly');
}

if (afterAi.nodes['node-1'].content !== 'A+') {
  throw new Error('AI update did not override through the shared design-update event');
}

if (afterAi.nodes['node-1'].lastActor !== 'ai-agent') {
  throw new Error('Concurrency handoff did not preserve the latest actor');
}

console.log('shared design-update flow verified');
