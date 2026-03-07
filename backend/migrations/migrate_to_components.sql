-- Migration script to move task array columns to task_components table

-- 1. Create task_components table
CREATE TABLE IF NOT EXISTS task_components (
    component_id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL,
    component_type TEXT NOT NULL,
    component_value TEXT NOT NULL,
    component_sequence INTEGER NOT NULL,
    FOREIGN KEY (task_id) REFERENCES task (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_task_components_task_id ON task_components(task_id);
CREATE INDEX IF NOT EXISTS idx_task_components_sequence ON task_components(task_id, component_sequence);

-- 2. Migrate existing data from task arrays to task_components

-- Migrate pr_links -> component_type: 'link'
INSERT INTO task_components (component_id, task_id, component_type, component_value, component_sequence)
SELECT 
    gen_random_uuid()::text,
    t.id,
    'link',
    link_value,
    ROW_NUMBER() OVER (PARTITION BY t.id ORDER BY ordinality) as seq
FROM task t
CROSS JOIN LATERAL unnest(t.pr_links) WITH ORDINALITY AS link_value
WHERE t.pr_links IS NOT NULL AND array_length(t.pr_links, 1) > 0;

-- Migrate important_links -> component_type: 'link'
INSERT INTO task_components (component_id, task_id, component_type, component_value, component_sequence)
SELECT 
    gen_random_uuid()::text,
    t.id,
    'link',
    link_value,
    (SELECT COALESCE(MAX(component_sequence), 0) FROM task_components WHERE task_id = t.id) + 
    ROW_NUMBER() OVER (PARTITION BY t.id ORDER BY ordinality) as seq
FROM task t
CROSS JOIN LATERAL unnest(t.important_links) WITH ORDINALITY AS link_value
WHERE t.important_links IS NOT NULL AND array_length(t.important_links, 1) > 0;

-- Migrate cmd_commands -> component_type: 'command'
INSERT INTO task_components (component_id, task_id, component_type, component_value, component_sequence)
SELECT 
    gen_random_uuid()::text,
    t.id,
    'command',
    cmd_value,
    (SELECT COALESCE(MAX(component_sequence), 0) FROM task_components WHERE task_id = t.id) + 
    ROW_NUMBER() OVER (PARTITION BY t.id ORDER BY ordinality) as seq
FROM task t
CROSS JOIN LATERAL unnest(t.cmd_commands) WITH ORDINALITY AS cmd_value
WHERE t.cmd_commands IS NOT NULL AND array_length(t.cmd_commands, 1) > 0;

-- Migrate saved_file_paths -> component_type: 'text_area' (as file path references)
INSERT INTO task_components (component_id, task_id, component_type, component_value, component_sequence)
SELECT 
    gen_random_uuid()::text,
    t.id,
    'text_area',
    'File: ' || file_value,
    (SELECT COALESCE(MAX(component_sequence), 0) FROM task_components WHERE task_id = t.id) + 
    ROW_NUMBER() OVER (PARTITION BY t.id ORDER BY ordinality) as seq
FROM task t
CROSS JOIN LATERAL unnest(t.saved_file_paths) WITH ORDINALITY AS file_value
WHERE t.saved_file_paths IS NOT NULL AND array_length(t.saved_file_paths, 1) > 0;

-- 3. Drop old columns from task table
ALTER TABLE task DROP COLUMN IF EXISTS pr_links;
ALTER TABLE task DROP COLUMN IF EXISTS important_links;
ALTER TABLE task DROP COLUMN IF EXISTS cmd_commands;
ALTER TABLE task DROP COLUMN IF EXISTS saved_file_paths;
