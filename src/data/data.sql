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