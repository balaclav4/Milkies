-- Milk Supply Tracker Database Schema
-- SQLite Database for tracking pumping and feeding data

-- Table: pumping_sessions
CREATE TABLE IF NOT EXISTS pumping_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    amount_oz REAL NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, time)
);

-- Table: baby_feedings
CREATE TABLE IF NOT EXISTS baby_feedings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    amount_oz REAL NOT NULL,
    nursed BOOLEAN DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, time)
);

-- Table: daily_stats (computed/cached stats for performance)
CREATE TABLE IF NOT EXISTS daily_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,
    total_pumped_oz REAL DEFAULT 0,
    pump_count INTEGER DEFAULT 0,
    total_fed_oz REAL DEFAULT 0,
    feed_count INTEGER DEFAULT 0,
    surplus_oz REAL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pumping_date ON pumping_sessions(date);
CREATE INDEX IF NOT EXISTS idx_feeding_date ON baby_feedings(date);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
