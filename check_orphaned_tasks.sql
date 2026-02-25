-- Check for orphaned tasks before cleanup
SELECT COUNT(*) as orphaned_count
FROM tasks
WHERE crop_cycle_id IS NULL 
  AND workflow_id IS NOT NULL 
  AND source_type = 'workflow_node';
