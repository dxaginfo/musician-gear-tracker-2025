-- Migration: 001_initial_schema
-- Description: Creates the initial database schema for the Musician Gear Tracker application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  profile_image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Equipment Table
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id),
  brand VARCHAR(255),
  model VARCHAR(255),
  serial_number VARCHAR(255),
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  current_value DECIMAL(10,2),
  condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 10),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Equipment Images Table
CREATE TABLE equipment_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id),
  image_url VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Specifications Table
CREATE TABLE specifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id),
  name VARCHAR(255) NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Maintenance Records Table
CREATE TABLE maintenance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id),
  maintenance_type VARCHAR(255) NOT NULL,
  date_performed DATE NOT NULL,
  performed_by VARCHAR(255),
  cost DECIMAL(10,2),
  notes TEXT,
  next_due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Maintenance Types Table
CREATE TABLE maintenance_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  default_interval_days INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage Logs Table
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id),
  event_name VARCHAR(255) NOT NULL,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  location VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Condition Logs Table
CREATE TABLE condition_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES equipment(id),
  condition_rating INTEGER CHECK (condition_rating BETWEEN 1 AND 10),
  notes TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Service Providers Table
CREATE TABLE service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  specialty TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_equipment_user_id ON equipment(user_id);
CREATE INDEX idx_equipment_category_id ON equipment(category_id);
CREATE INDEX idx_equipment_images_equipment_id ON equipment_images(equipment_id);
CREATE INDEX idx_specifications_equipment_id ON specifications(equipment_id);
CREATE INDEX idx_maintenance_records_equipment_id ON maintenance_records(equipment_id);
CREATE INDEX idx_usage_logs_equipment_id ON usage_logs(equipment_id);
CREATE INDEX idx_condition_logs_equipment_id ON condition_logs(equipment_id);
CREATE INDEX idx_service_providers_user_id ON service_providers(user_id);

-- Insert default categories
INSERT INTO categories (name) VALUES 
('Guitars'),
('Basses'),
('Drums'),
('Keyboards'),
('Amplifiers'),
('Effects'),
('Microphones'),
('Recording Equipment'),
('Accessories'),
('Other');

-- Insert child categories for Guitars
INSERT INTO categories (name, parent_id) 
SELECT 'Electric Guitars', id FROM categories WHERE name = 'Guitars';

INSERT INTO categories (name, parent_id) 
SELECT 'Acoustic Guitars', id FROM categories WHERE name = 'Guitars';

INSERT INTO categories (name, parent_id) 
SELECT 'Classical Guitars', id FROM categories WHERE name = 'Guitars';

-- Insert child categories for Effects
INSERT INTO categories (name, parent_id) 
SELECT 'Distortion/Overdrive', id FROM categories WHERE name = 'Effects';

INSERT INTO categories (name, parent_id) 
SELECT 'Modulation', id FROM categories WHERE name = 'Effects';

INSERT INTO categories (name, parent_id) 
SELECT 'Delay/Reverb', id FROM categories WHERE name = 'Effects';

-- Insert default maintenance types
INSERT INTO maintenance_types (name, default_interval_days) VALUES 
('String Change', 90),
('Cleaning', 30),
('Setup/Adjustment', 180),
('Battery Replacement', 60),
('Tube Replacement', 365),
('Software Update', 90),
('Calibration', 180);