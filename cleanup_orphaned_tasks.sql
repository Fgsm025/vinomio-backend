-- Identify orphaned tasks (workflow-based tasks with null cropCycleId)
SELECT id, title, source_type, crop_cycle_id, workflow_id, node_id, created_at
FROM tasks
WHERE crop_cycle_id IS NULL 
  AND workflow_id IS NOT NULL 
  AND source_type = 'workflow_node';

-- Clean up orphaned workflow tasks that have no associated crop cycle
DELETE FROM tasks
WHERE crop_cycle_id IS NULL 
  AND workflow_id IS NOT NULL 
  AND source_type = 'workflow_node';
