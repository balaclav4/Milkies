-- Milk Supply Tracker - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Table: pumping_sessions
CREATE TABLE IF NOT EXISTS pumping_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    amount_oz DECIMAL(5,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date, time)
);

-- Table: baby_feedings
CREATE TABLE IF NOT EXISTS baby_feedings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    amount_oz DECIMAL(5,2) NOT NULL,
    nursed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date, time)
);

-- Table: daily_stats (computed/cached stats for performance)
CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_pumped_oz DECIMAL(6,2) DEFAULT 0,
    pump_count INTEGER DEFAULT 0,
    total_fed_oz DECIMAL(6,2) DEFAULT 0,
    feed_count INTEGER DEFAULT 0,
    surplus_oz DECIMAL(6,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_pumping_user_date ON pumping_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_feeding_user_date ON baby_feedings(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE pumping_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_feedings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Pumping Sessions Policies
CREATE POLICY "Users can view their own pumping sessions"
    ON pumping_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pumping sessions"
    ON pumping_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pumping sessions"
    ON pumping_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pumping sessions"
    ON pumping_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Baby Feedings Policies
CREATE POLICY "Users can view their own baby feedings"
    ON baby_feedings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own baby feedings"
    ON baby_feedings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own baby feedings"
    ON baby_feedings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own baby feedings"
    ON baby_feedings FOR DELETE
    USING (auth.uid() = user_id);

-- Daily Stats Policies
CREATE POLICY "Users can view their own daily stats"
    ON daily_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily stats"
    ON daily_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily stats"
    ON daily_stats FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily stats"
    ON daily_stats FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_pumping_sessions_updated_at
    BEFORE UPDATE ON pumping_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_baby_feedings_updated_at
    BEFORE UPDATE ON baby_feedings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at
    BEFORE UPDATE ON daily_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to recalculate daily stats for a user and date
CREATE OR REPLACE FUNCTION recalculate_daily_stats(p_user_id UUID, p_date DATE)
RETURNS VOID AS $$
DECLARE
    v_total_pumped DECIMAL(6,2);
    v_pump_count INTEGER;
    v_total_fed DECIMAL(6,2);
    v_feed_count INTEGER;
BEGIN
    -- Calculate pumping stats
    SELECT COALESCE(SUM(amount_oz), 0), COALESCE(COUNT(*), 0)
    INTO v_total_pumped, v_pump_count
    FROM pumping_sessions
    WHERE user_id = p_user_id AND date = p_date;

    -- Calculate feeding stats
    SELECT COALESCE(SUM(amount_oz), 0), COALESCE(COUNT(*), 0)
    INTO v_total_fed, v_feed_count
    FROM baby_feedings
    WHERE user_id = p_user_id AND date = p_date;

    -- Upsert daily stats
    INSERT INTO daily_stats (user_id, date, total_pumped_oz, pump_count, total_fed_oz, feed_count, surplus_oz)
    VALUES (
        p_user_id,
        p_date,
        v_total_pumped,
        v_pump_count,
        v_total_fed,
        v_feed_count,
        v_total_pumped - v_total_fed
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
        total_pumped_oz = EXCLUDED.total_pumped_oz,
        pump_count = EXCLUDED.pump_count,
        total_fed_oz = EXCLUDED.total_fed_oz,
        feed_count = EXCLUDED.feed_count,
        surplus_oz = EXCLUDED.surplus_oz,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATING DAILY STATS
-- ============================================================================

-- Trigger function to update daily stats when pumping session changes
CREATE OR REPLACE FUNCTION trigger_update_daily_stats_pumping()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recalculate_daily_stats(OLD.user_id, OLD.date);
        RETURN OLD;
    ELSE
        PERFORM recalculate_daily_stats(NEW.user_id, NEW.date);
        IF TG_OP = 'UPDATE' AND OLD.date != NEW.date THEN
            PERFORM recalculate_daily_stats(OLD.user_id, OLD.date);
        END IF;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to update daily stats when feeding changes
CREATE OR REPLACE FUNCTION trigger_update_daily_stats_feeding()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM recalculate_daily_stats(OLD.user_id, OLD.date);
        RETURN OLD;
    ELSE
        PERFORM recalculate_daily_stats(NEW.user_id, NEW.date);
        IF TG_OP = 'UPDATE' AND OLD.date != NEW.date THEN
            PERFORM recalculate_daily_stats(OLD.user_id, OLD.date);
        END IF;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_daily_stats_on_pumping_change
    AFTER INSERT OR UPDATE OR DELETE ON pumping_sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_daily_stats_pumping();

CREATE TRIGGER update_daily_stats_on_feeding_change
    AFTER INSERT OR UPDATE OR DELETE ON baby_feedings
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_daily_stats_feeding();
