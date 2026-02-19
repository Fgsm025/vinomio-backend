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

  return {
    title: firstTaskNode.data?.label || firstTaskNode.data?.title || 'Tarea',
    description: firstTaskNode.data?.description || '',
    status: 'todo',
    sourceType: 'workflow_node',
    cropCycleId,
    workflowId,
    workflowName,
    cropCycleName,
    plotName,
    nodeId: firstTaskNode.id,
    stageIndex,
    nodeType: firstTaskNode.type,
    nodeData: firstTaskNode.data,
    conditionOptions: firstTaskNode.data?.options || [],
    farmId,
  };
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

  let nextEdge;

  if (outgoingEdges.length === 1) {
    nextEdge = outgoingEdges[0];
  } else if (answer) {
    nextEdge =
      outgoingEdges.find((e) => e.label?.toLowerCase() === answer?.toLowerCase()) ||
      outgoingEdges[0];
  } else {
    nextEdge = outgoingEdges[0];
  }

  const nextNode = workflowNodes.find((n) => n.id === nextEdge.target);

  if (!nextNode || nextNode.type === 'end') return null;

  return {
    title: nextNode.data?.label || nextNode.data?.title || 'Tarea',
    description: nextNode.data?.description || '',
    status: 'todo',
    sourceType: 'workflow_node',
    cropCycleId,
    workflowId,
    workflowName,
    cropCycleName,
    plotName,
    nodeId: nextNode.id,
    stageIndex,
    nodeType: nextNode.type,
    nodeData: nextNode.data,
    conditionOptions: nextNode.data?.options || [],
    farmId,
  };
}
