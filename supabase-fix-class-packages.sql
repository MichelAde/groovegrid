-- Fix class_packages table to allow NULL credits for unlimited packages
-- Run this in Supabase SQL Editor BEFORE running load-mikilele-data.sql

-- Remove NOT NULL constraint from credits column
ALTER TABLE class_packages 
ALTER COLUMN credits DROP NOT NULL;

-- Success message
SELECT 'class_packages.credits column now allows NULL for unlimited packages!' AS status;

