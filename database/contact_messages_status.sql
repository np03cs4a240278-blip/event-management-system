-- Migration: Add status column to contact_messages table
-- Run this once against your event_management_system database

USE event_management_system;

ALTER TABLE contact_messages
  ADD COLUMN IF NOT EXISTS status ENUM('new', 'read', 'replied') NOT NULL DEFAULT 'new'
  AFTER message;
