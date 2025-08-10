-- Check for any remaining triggers on transactions table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers 
WHERE event_object_table = 'transactions' 
    AND event_object_schema = 'public';

-- Also check for any functions that might be causing issues
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name LIKE '%category%'
    AND routine_name LIKE '%spent%';