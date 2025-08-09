-- Category Suggestions System - Database Schema
-- Tracks user category usage patterns for intelligent suggestions

-- Create category_usage table to track frequency and recency
CREATE TABLE public.category_usage (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    usage_count INTEGER DEFAULT 1 NOT NULL,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    weekly_frequency DECIMAL(5,2) DEFAULT 0, -- Average uses per week
    monthly_frequency DECIMAL(5,2) DEFAULT 0, -- Average uses per month
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, category_id)
);

-- Create recent_categories table for quick recent category lookup
CREATE TABLE public.recent_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_ids UUID[] DEFAULT '{}' NOT NULL, -- Array of category UUIDs in order
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id)
);

-- Create category_keywords table for description-based suggestions
CREATE TABLE public.category_keywords (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL for global keywords
    keywords TEXT[] DEFAULT '{}' NOT NULL,
    confidence_scores DECIMAL(5,2)[] DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create category_amount_patterns table for amount-based suggestions
CREATE TABLE public.category_amount_patterns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    typical_amount_min DECIMAL(10,2) NOT NULL,
    typical_amount_max DECIMAL(10,2) NOT NULL,
    average_amount DECIMAL(10,2) NOT NULL,
    confidence_threshold DECIMAL(5,2) DEFAULT 0.7 NOT NULL,
    transaction_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, category_id)
);

-- Create category_time_patterns table for time-based suggestions
CREATE TABLE public.category_time_patterns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    day_of_week_patterns INTEGER[] DEFAULT '{0,0,0,0,0,0,0}' NOT NULL, -- Sun-Sat frequency
    hour_patterns INTEGER[] DEFAULT '{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0}' NOT NULL, -- 0-23 hour frequency (24 hours)
    monthly_patterns INTEGER[] DEFAULT '{0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0}' NOT NULL, -- 1-31 day frequency (31 days)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, category_id)
);

-- Enable Row Level Security for new tables
ALTER TABLE public.category_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recent_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_amount_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_time_patterns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for category_usage
CREATE POLICY "Users can only see their own category usage" ON public.category_usage
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for recent_categories
CREATE POLICY "Users can only see their own recent categories" ON public.recent_categories
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for category_keywords (includes global keywords)
CREATE POLICY "Users can see global keywords and their own" ON public.category_keywords
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);

CREATE POLICY "Users can only modify their own keywords" ON public.category_keywords
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own keywords" ON public.category_keywords
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own keywords" ON public.category_keywords
    FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for category_amount_patterns
CREATE POLICY "Users can only see their own amount patterns" ON public.category_amount_patterns
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for category_time_patterns
CREATE POLICY "Users can only see their own time patterns" ON public.category_time_patterns
    FOR ALL USING (auth.uid() = user_id);

-- Create performance indexes
CREATE INDEX idx_category_usage_user_frequency ON public.category_usage (user_id, usage_count DESC, last_used DESC);
CREATE INDEX idx_category_usage_category ON public.category_usage (category_id);
CREATE INDEX idx_recent_categories_user ON public.recent_categories (user_id, last_updated DESC);
CREATE INDEX idx_category_keywords_search ON public.category_keywords USING gin(keywords);
CREATE INDEX idx_category_keywords_category ON public.category_keywords (category_id);
CREATE INDEX idx_category_amount_patterns_user ON public.category_amount_patterns (user_id, category_id);
CREATE INDEX idx_category_time_patterns_user ON public.category_time_patterns (user_id, category_id);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_category_usage_updated_at BEFORE UPDATE ON public.category_usage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recent_categories_updated_at BEFORE UPDATE ON public.recent_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_keywords_updated_at BEFORE UPDATE ON public.category_keywords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_amount_patterns_updated_at BEFORE UPDATE ON public.category_amount_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_time_patterns_updated_at BEFORE UPDATE ON public.category_time_patterns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update category usage statistics
CREATE OR REPLACE FUNCTION update_category_usage_stats(
    p_user_id UUID,
    p_category_id UUID
) RETURNS VOID AS $$
DECLARE
    current_usage INTEGER;
    weeks_since_created DECIMAL;
    months_since_created DECIMAL;
BEGIN
    -- Insert or update category usage
    INSERT INTO public.category_usage (user_id, category_id, usage_count, last_used)
    VALUES (p_user_id, p_category_id, 1, NOW())
    ON CONFLICT (user_id, category_id)
    DO UPDATE SET
        usage_count = category_usage.usage_count + 1,
        last_used = NOW();

    -- Calculate frequency statistics
    SELECT usage_count INTO current_usage
    FROM public.category_usage
    WHERE user_id = p_user_id AND category_id = p_category_id;

    -- Calculate weeks/months since first use for frequency calculations
    SELECT 
        GREATEST(1, EXTRACT(EPOCH FROM (NOW() - created_at)) / (7 * 24 * 3600)),
        GREATEST(1, EXTRACT(EPOCH FROM (NOW() - created_at)) / (30 * 24 * 3600))
    INTO weeks_since_created, months_since_created
    FROM public.category_usage
    WHERE user_id = p_user_id AND category_id = p_category_id;

    -- Update frequency calculations
    UPDATE public.category_usage
    SET 
        weekly_frequency = current_usage / weeks_since_created,
        monthly_frequency = current_usage / months_since_created
    WHERE user_id = p_user_id AND category_id = p_category_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update recent categories
CREATE OR REPLACE FUNCTION update_recent_categories(
    p_user_id UUID,
    p_category_id UUID
) RETURNS VOID AS $$
DECLARE
    current_recent UUID[];
    new_recent UUID[];
BEGIN
    -- Get current recent categories
    SELECT category_ids INTO current_recent
    FROM public.recent_categories
    WHERE user_id = p_user_id;

    -- If no record exists, create one
    IF current_recent IS NULL THEN
        INSERT INTO public.recent_categories (user_id, category_ids)
        VALUES (p_user_id, ARRAY[p_category_id]);
        RETURN;
    END IF;

    -- Remove the category if it already exists
    current_recent := array_remove(current_recent, p_category_id);
    
    -- Add to beginning of array
    new_recent := p_category_id || current_recent;
    
    -- Keep only the 10 most recent
    IF array_length(new_recent, 1) > 10 THEN
        new_recent := new_recent[1:10];
    END IF;

    -- Update the record
    UPDATE public.recent_categories
    SET 
        category_ids = new_recent,
        last_updated = NOW()
    WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update amount patterns
CREATE OR REPLACE FUNCTION update_amount_patterns(
    p_user_id UUID,
    p_category_id UUID,
    p_amount DECIMAL(10,2)
) RETURNS VOID AS $$
DECLARE
    existing_count INTEGER;
    existing_avg DECIMAL(10,2);
    new_avg DECIMAL(10,2);
    new_min DECIMAL(10,2);
    new_max DECIMAL(10,2);
BEGIN
    -- Check if pattern exists
    SELECT transaction_count, average_amount
    INTO existing_count, existing_avg
    FROM public.category_amount_patterns
    WHERE user_id = p_user_id AND category_id = p_category_id;

    IF existing_count IS NULL THEN
        -- Create new pattern
        INSERT INTO public.category_amount_patterns (
            user_id, category_id, typical_amount_min, typical_amount_max, 
            average_amount, transaction_count
        ) VALUES (
            p_user_id, p_category_id, p_amount, p_amount, p_amount, 1
        );
    ELSE
        -- Update existing pattern
        new_avg := ((existing_avg * existing_count) + p_amount) / (existing_count + 1);
        
        SELECT 
            LEAST(typical_amount_min, p_amount),
            GREATEST(typical_amount_max, p_amount)
        INTO new_min, new_max
        FROM public.category_amount_patterns
        WHERE user_id = p_user_id AND category_id = p_category_id;

        UPDATE public.category_amount_patterns
        SET 
            typical_amount_min = new_min,
            typical_amount_max = new_max,
            average_amount = new_avg,
            transaction_count = existing_count + 1
        WHERE user_id = p_user_id AND category_id = p_category_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update time patterns
CREATE OR REPLACE FUNCTION update_time_patterns(
    p_user_id UUID,
    p_category_id UUID,
    p_transaction_date DATE
) RETURNS VOID AS $$
DECLARE
    dow INTEGER; -- Day of week (0=Sunday, 6=Saturday)
    hour_val INTEGER; -- Hour (0-23)
    day_val INTEGER; -- Day of month (1-31)
    current_dow INTEGER[];
    current_hour INTEGER[];
    current_day INTEGER[];
BEGIN
    -- Extract time components
    SELECT 
        EXTRACT(DOW FROM p_transaction_date)::INTEGER,
        EXTRACT(HOUR FROM NOW())::INTEGER, -- Use current time for hour
        EXTRACT(DAY FROM p_transaction_date)::INTEGER
    INTO dow, hour_val, day_val;

    -- Insert or update time patterns
    INSERT INTO public.category_time_patterns (
        user_id, category_id, day_of_week_patterns, hour_patterns, monthly_patterns
    ) VALUES (
        p_user_id, p_category_id,
        (SELECT array_agg(CASE WHEN i = dow THEN 1 ELSE 0 END ORDER BY i) FROM generate_series(0, 6) i),
        (SELECT array_agg(CASE WHEN i = hour_val THEN 1 ELSE 0 END ORDER BY i) FROM generate_series(0, 23) i),
        (SELECT array_agg(CASE WHEN i = day_val THEN 1 ELSE 0 END ORDER BY i) FROM generate_series(1, 31) i)
    )
    ON CONFLICT (user_id, category_id)
    DO UPDATE SET
        day_of_week_patterns[dow + 1] = category_time_patterns.day_of_week_patterns[dow + 1] + 1,
        hour_patterns[hour_val + 1] = category_time_patterns.hour_patterns[hour_val + 1] + 1,
        monthly_patterns[day_val] = category_time_patterns.monthly_patterns[day_val] + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to update all category analytics when a transaction is created
CREATE OR REPLACE FUNCTION update_category_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update usage statistics
    PERFORM update_category_usage_stats(NEW.user_id, NEW.category_id);
    
    -- Update recent categories
    PERFORM update_recent_categories(NEW.user_id, NEW.category_id);
    
    -- Update amount patterns
    PERFORM update_amount_patterns(NEW.user_id, NEW.category_id, NEW.amount);
    
    -- Update time patterns
    PERFORM update_time_patterns(NEW.user_id, NEW.category_id, NEW.date);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update category analytics on transaction insert
CREATE TRIGGER update_category_analytics_on_transaction
    AFTER INSERT ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_category_analytics();