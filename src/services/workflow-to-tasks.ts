const TASK_NODE_TYPES = ['task', 'wait'];

export function getConditionOptionsForNode(
  nodeId: string,
  workflowNodes: any[],
  workflowEdges: any[],
): string[] {
  const outgoing = workflowEdges.filter((e) => e.source === nodeId);
  if (outgoing.length !== 1) return [];
  const nextNode = workflowNodes.find((n) => n.id === outgoing[0].target);
  if (!nextNode || nextNode.type !== 'condition') return [];
  const data = nextNode.data || {};
  const outputs = data.outputs;
  if (Array.isArray(outputs) && outputs.length > 0) return outputs;
  const yes = data.outputYes;
  const no = data.outputNo;
  if (yes != null || no != null) return [yes ?? 'Yes', no ?? 'No'];
  return [];
}

function nodeToTaskPayload(
  node: any,
  workflowNodes: any[],
  workflowEdges: any[],
  cropCycleId: string,
  workflowId: string,
  workflowName: string,
  cropCycleName: string,
  plotName: string,
  stageIndex: number,
  farmId: string,
) {
  const conditionOptions =
    node.type === 'task' || node.type === 'wait'
      ? getConditionOptionsForNode(node.id, workflowNodes, workflowEdges)
      : [];
  return {
    title: node.data?.label || node.data?.title || 'Task',
    description: node.data?.description || '',
    status: 'todo' as const,
    sourceType: 'workflow_node' as const,
    cropCycleId,
    workflowId,
    workflowName,
    cropCycleName,
    plotName,
    nodeId: node.id,
    stageIndex,
    nodeType: node.type,
    nodeData: node.data,
    conditionOptions: conditionOptions.length > 0 ? conditionOptions : (node.data?.options || []),
    farmId,
  };
}

export function getAllTasksFromWorkflowTemplate(
  workflowNodes: any[],
  workflowEdges: any[],
  cropCycleId: string,
  workflowId: string,
  workflowName: string,
  cropCycleName: string,
  plotName: string,
  stageIndex: number,
  farmId: string,
): any[] {
  const startNode = workflowNodes.find((n) => n.type === 'start') || workflowNodes[0];
  if (!startNode) return [];

  const visited = new Set<string>();
  const queue: string[] = [startNode.id];
  const taskPayloads: any[] = [];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = workflowNodes.find((n) => n.id === nodeId);
    if (!node) continue;
    if (node.type === 'end') continue;

    if (TASK_NODE_TYPES.includes(node.type)) {
      taskPayloads.push(
        nodeToTaskPayload(
          node,
          workflowNodes,
          workflowEdges,
          cropCycleId,
          workflowId,
          workflowName,
          cropCycleName,
          plotName,
          stageIndex,
          farmId,
        ),
      );
    }

    const outgoing = workflowEdges.filter((e) => e.source === nodeId);
    for (const edge of outgoing) {
      if (!visited.has(edge.target)) {
        queue.push(edge.target);
      }
    }
  }

  return taskPayloads;
}

export function getFirstTaskFromWorkflow(
  workflowNodes: any[],
  workflowEdges: any[],
  cropCycleId: string,
  workflowId: string,
  workflowName: string,
  cropCycleName: string,
  plotName: string,
  stageIndex: number,
  farmId: string,
) {
  const startNode = workflowNodes.find((n) => n.type === 'start') || workflowNodes[0];

  if (!startNode) return null;

  const firstEdge = workflowEdges.find((e) => e.source === startNode.id);
  const firstTaskNode = firstEdge
    ? workflowNodes.find((n) => n.id === firstEdge.target)
    : startNode;

  if (!firstTaskNode || firstTaskNode.type === 'start') return null;

  return nodeToTaskPayload(
    firstTaskNode,
    workflowNodes,
    workflowEdges,
    cropCycleId,
    workflowId,
    workflowName,
    cropCycleName,
    plotName,
    stageIndex,
    farmId,
  );
}

export function getNextTask(
  completedNodeId: string,
  answer: string | undefined,
  workflowNodes: any[],
  workflowEdges: any[],
  cropCycleId: string,
  workflowId: string,
  workflowName: string,
  cropCycleName: string,
  plotName: string,
  stageIndex: number,
  farmId: string,
) {
  const outgoingEdges = workflowEdges.filter((e) => e.source === completedNodeId);
  if (outgoingEdges.length === 0) return null;

  const firstEdge = outgoingEdges[0];
  let nextNode = workflowNodes.find((n) => n.id === firstEdge.target);
  if (!nextNode) return null;

  if (nextNode.type === 'condition') {
    if (!answer) return null;
    const conditionOutgoing = workflowEdges.filter((e) => e.source === nextNode.id);
    const conditionData = nextNode.data || {};
    const outputs = Array.isArray(conditionData.outputs)
      ? conditionData.outputs
      : [conditionData.outputYes ?? 'Yes', conditionData.outputNo ?? 'No'];
    const answerNorm = String(answer).toLowerCase();
    let answerEdge =
      conditionOutgoing.find((e) => String(e.label || '').toLowerCase() === answerNorm) ??
      null;
    if (!answerEdge && outputs.length > 0) {
      const answerIndex = outputs.findIndex((o: string) => String(o).toLowerCase() === answerNorm);
      if (answerIndex >= 0) {
        answerEdge =
          conditionOutgoing.find((e) => e.sourceHandle === `output-${answerIndex}`) ??
          conditionOutgoing[answerIndex] ??
          conditionOutgoing[0];
      } else {
        answerEdge = conditionOutgoing[0];
      }
    }
    if (!answerEdge) answerEdge = conditionOutgoing[0];
    if (!answerEdge) return null;
    nextNode = workflowNodes.find((n) => n.id === answerEdge.target);
    if (!nextNode || nextNode.type === 'end') return null;
  } else if (outgoingEdges.length > 1 && answer) {
    const answerEdge =
      outgoingEdges.find((e) => (e.label || '').toLowerCase() === answer.toLowerCase()) ||
      outgoingEdges[0];
    nextNode = workflowNodes.find((n) => n.id === answerEdge.target);
    if (!nextNode || nextNode.type === 'end') return null;
  }

  if (nextNode.type === 'condition') return null;

  return nodeToTaskPayload(
    nextNode,
    workflowNodes,
    workflowEdges,
    cropCycleId,
    workflowId,
    workflowName,
    cropCycleName,
    plotName,
    stageIndex,
    farmId,
  );
}
