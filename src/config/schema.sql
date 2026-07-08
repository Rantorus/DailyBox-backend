-- ========================================================
-- DAILYBOX DATABASE SCHEMA
-- ========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar TEXT,
    location VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    stats JSONB DEFAULT '{"completedBoxes": 0, "activeChapters": 0, "streakDays": 0}',
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- 2. CHAPTERS TABLE
CREATE TABLE IF NOT EXISTS chapters (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    cover_image TEXT,
    is_favorite BOOLEAN DEFAULT false,
    type VARCHAR(50) DEFAULT 'General',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. BOXES TABLE
CREATE TABLE IF NOT EXISTS boxes (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50), 
    date TIMESTAMP NOT NULL,
    description TEXT,
    tags TEXT[],
    priority VARCHAR(20),
    type VARCHAR(50),
    is_favorite BOOLEAN DEFAULT false,
    
    -- Location
    has_location BOOLEAN DEFAULT false,
    location_address TEXT,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    
    -- Reminder
    has_reminder BOOLEAN DEFAULT false,
    reminder_date TIMESTAMP,
    reminder_title VARCHAR(100),
    is_reminded BOOLEAN DEFAULT false,
    
    -- Note
    has_note BOOLEAN DEFAULT false,
    note_title VARCHAR(150),
    note_content TEXT,
    note_is_visible BOOLEAN DEFAULT true,
    
    -- Media Arrays
    has_media BOOLEAN DEFAULT false,
    media_photos JSONB DEFAULT '[]'::jsonb,
    media_docs JSONB DEFAULT '[]'::jsonb,
    media_audio JSONB DEFAULT '[]'::jsonb,

    status VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. BOX TODOS TABLE
CREATE TABLE IF NOT EXISTS box_todos (
    id VARCHAR(50) PRIMARY KEY,
    box_id VARCHAR(50) REFERENCES boxes(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    position_index INT
);

-- 5. CHAPTER - BOXES BAĞLANTI TABLOSU (Many-to-Many)
CREATE TABLE IF NOT EXISTS chapter_boxes (
    chapter_id VARCHAR(50) REFERENCES chapters(id) ON DELETE CASCADE,
    box_id VARCHAR(50) REFERENCES boxes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (chapter_id, box_id)
);

