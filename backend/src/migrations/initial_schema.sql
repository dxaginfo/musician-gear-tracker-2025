-- Initial database schema for Musician Gear Tracker
-- Migration: 01_initial_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    profile_image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    purchase_date DATE,
    purchase_price DECIMAL(10, 2),
    current_value DECIMAL(10, 2),
    condition_rating INTEGER CHECK (condition_rating >= 1 AND condition_rating <= 10),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Images table
CREATE TABLE IF NOT EXISTS equipment_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on equipment_images
CREATE INDEX idx_equipment_images_equipment_id ON equipment_images(equipment_id);

-- Specifications table
CREATE TABLE IF NOT EXISTS specifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on specifications
CREATE INDEX idx_specifications_equipment_id ON specifications(equipment_id);

-- Maintenance Types table
CREATE TABLE IF NOT EXISTS maintenance_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    default_interval_days INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(255) NOT NULL,
    date_performed DATE NOT NULL,
    performed_by VARCHAR(255),
    cost DECIMAL(10, 2),
    notes TEXT,
    next_due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on maintenance_records
CREATE INDEX idx_maintenance_records_equipment_id ON maintenance_records(equipment_id);
CREATE INDEX idx_maintenance_records_next_due_date ON maintenance_records(next_due_date);

-- Usage Logs table
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on usage_logs
CREATE INDEX idx_usage_logs_equipment_id ON usage_logs(equipment_id);
CREATE INDEX idx_usage_logs_start_date ON usage_logs(start_date);

-- Condition Logs table
CREATE TABLE IF NOT EXISTS condition_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    condition_rating INTEGER NOT NULL CHECK (condition_rating >= 1 AND condition_rating <= 10),
    notes TEXT,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on condition_logs
CREATE INDEX idx_condition_logs_equipment_id ON condition_logs(equipment_id);

-- Service Providers table
CREATE TABLE IF NOT EXISTS service_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    specialty TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create default categories
INSERT INTO categories (name) VALUES
    ('Guitars'),
    ('Basses'),
    ('Drums & Percussion'),
    ('Keyboards & Pianos'),
    ('Amplifiers'),
    ('Effects & Pedals'),
    ('Recording Equipment'),
    ('Microphones'),
    ('DJ Equipment'),
    ('Live Sound'),
    ('Wind Instruments'),
    ('String Instruments'),
    ('Accessories'),
    ('Other');

-- Guitar subcategories
INSERT INTO categories (name, parent_id) 
SELECT 'Electric Guitars', id FROM categories WHERE name = 'Guitars';

INSERT INTO categories (name, parent_id) 
SELECT 'Acoustic Guitars', id FROM categories WHERE name = 'Guitars';

INSERT INTO categories (name, parent_id) 
SELECT 'Classical Guitars', id FROM categories WHERE name = 'Guitars';

-- Keyboard subcategories
INSERT INTO categories (name, parent_id) 
SELECT 'Digital Pianos', id FROM categories WHERE name = 'Keyboards & Pianos';

INSERT INTO categories (name, parent_id) 
SELECT 'Synthesizers', id FROM categories WHERE name = 'Keyboards & Pianos';

INSERT INTO categories (name, parent_id) 
SELECT 'MIDI Controllers', id FROM categories WHERE name = 'Keyboards & Pianos';

-- Recording Equipment subcategories
INSERT INTO categories (name, parent_id) 
SELECT 'Audio Interfaces', id FROM categories WHERE name = 'Recording Equipment';

INSERT INTO categories (name, parent_id) 
SELECT 'Mixers', id FROM categories WHERE name = 'Recording Equipment';

INSERT INTO categories (name, parent_id) 
SELECT 'Studio Monitors', id FROM categories WHERE name = 'Recording Equipment';

-- Create default maintenance types
INSERT INTO maintenance_types (user_id, name, default_interval_days)
SELECT 
    (SELECT id FROM users LIMIT 1),  -- This will be replaced with actual user IDs when users register
    name,
    interval_days
FROM (
    VALUES 
        ('String Change', 90),
        ('Setup & Intonation', 180),
        ('Cleaning', 30),
        ('Electronics Check', 180),
        ('Action Adjustment', 180),
        ('Deep Cleaning', 365),
        ('Battery Replacement', 180),
        ('Tube Replacement', 730),
        ('Firmware Update', 90),
        ('Drum Head Replacement', 180)
) AS maintenance_types(name, interval_days);