/*
Add email column to agency table
*/

-- == PRE-UPDATE CHECKS ==
-- Count number of agencies
SELECT COUNT(*) as oldAgencyCount FROM agencies;  

-- == UPDATE ==
-- Add email column to agencies

ALTER TABLE agencies
ADD email varchar(255) NOT NULL;


-- == POST-UPDATE CHECKS ==
-- Check the number of agencies
-- ~ Should be the same as pre-update

SELECT COUNT(*) as newAgencyCount FROM agencies;  