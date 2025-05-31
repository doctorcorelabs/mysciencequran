-- Table for Quran verses
CREATE TABLE IF NOT EXISTS verses (
    id SERIAL PRIMARY KEY,
    surah_number INT NOT NULL,
    verse_number INT NOT NULL,
    arabic_text TEXT NOT NULL,
    UNIQUE (surah_number, verse_number)
);

-- Table for translations
CREATE TABLE IF NOT EXISTS translations (
    id SERIAL PRIMARY KEY,
    verse_id INT NOT NULL REFERENCES verses(id),
    language VARCHAR(10) NOT NULL,
    text TEXT NOT NULL,
    UNIQUE (verse_id, language)
);

-- Table for transliterations (if needed, can be part of translations or separate)
CREATE TABLE IF NOT EXISTS transliterations (
    id SERIAL PRIMARY KEY,
    verse_id INT NOT NULL REFERENCES verses(id),
    text TEXT NOT NULL,
    UNIQUE (verse_id)
);

-- Table for thematic categories
CREATE TABLE IF NOT EXISTS themes (
    id VARCHAR(255) PRIMARY KEY, -- Changed to VARCHAR for custom IDs like 'biology'
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(50), -- Added color column
    icon_name VARCHAR(100) -- Added icon_name column
);

-- Junction table for verses and themes (many-to-many relationship)
CREATE TABLE IF NOT EXISTS verse_themes (
    verse_id INT NOT NULL REFERENCES verses(id),
    theme_id INT NOT NULL REFERENCES themes(id),
    PRIMARY KEY (verse_id, theme_id)
);

-- Table for AI analysis results (example structure)
CREATE TABLE IF NOT EXISTS analyses (
    id SERIAL PRIMARY KEY,
    verse_id INT REFERENCES verses(id), -- Can be null if analysis is on custom text
    input_text TEXT NOT NULL,
    analysis_result JSONB NOT NULL, -- Store AI output as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for popular findings (can be curated or derived from analyses)
CREATE TABLE IF NOT EXISTS popular_findings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    related_verse_id INT REFERENCES verses(id),
    analysis_id INT REFERENCES analyses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
