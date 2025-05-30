-- Add answers column to completions table to store test answers
-- This migration ensures the column exists for storing JSON test answers

-- Check if the column exists and add it if it doesn't
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'completions'
    AND COLUMN_NAME = 'answers'
);

-- Add the column only if it doesn't exist
SET @sql = IF(@column_exists = 0,
    'ALTER TABLE completions ADD COLUMN answers JSON NULL COMMENT "Stores student test answers in JSON format"',
    'SELECT "Column answers already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Show the result
SELECT 
    CASE 
        WHEN @column_exists = 0 THEN 'Added answers column to completions table'
        ELSE 'answers column already exists in completions table'
    END as result; 