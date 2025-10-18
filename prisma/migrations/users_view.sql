-- CreateUsersView.sql
-- This script creates a database view that combines teachers and students
-- It's necessary for the Message model to work properly

-- Create or replace the users_view
CREATE OR REPLACE VIEW users_view AS
    -- Teachers
    SELECT 
        id, 
        name, 
        'teacher' AS role
    FROM 
        "Teacher"
    UNION ALL
    -- Students
    SELECT 
        id, 
        name, 
        'student' AS role
    FROM 
        "Student";