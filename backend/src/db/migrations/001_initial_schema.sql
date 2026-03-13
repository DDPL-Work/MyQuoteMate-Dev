-- MyQuoteMate Production Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL if not set yet
    full_name VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active', -- active, suspended, deleted
    metadata JSONB DEFAULT '{}',
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- LEADS TABLE (before account creation)
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    converted_to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    converted_at TIMESTAMP WITH TIME ZONE,
    source VARCHAR(100) DEFAULT 'organic',
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_converted ON leads(converted_to_user_id);

-- JOBS TABLE (analysis requests)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', 
    -- pending, processing, completed, failed, expired
    tier VARCHAR(50) NOT NULL DEFAULT 'free', -- free, standard, premium
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP WITH TIME ZONE, -- for free tier auto-deletion
    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired')),
    CONSTRAINT valid_tier CHECK (tier IN ('free', 'standard', 'premium'))
);

CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_tier ON jobs(tier);
CREATE INDEX idx_jobs_expires_at ON jobs(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_jobs_created_at ON jobs(created_at);

-- DOCUMENTS TABLE
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    original_filename VARCHAR(500) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_key VARCHAR(500) NOT NULL UNIQUE, -- S3 key
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    extracted_text TEXT, -- OCR/parsed text
    extraction_method VARCHAR(50), -- native_pdf, ocr_tesseract, ocr_cloud
    extraction_confidence NUMERIC(5,2), -- 0-100
    extraction_issues JSONB, -- warnings, low confidence areas
    checksum VARCHAR(64), -- SHA256
    deleted_at TIMESTAMP WITH TIME ZONE, -- soft delete for retention
    expires_at TIMESTAMP WITH TIME ZONE, -- auto-delete date
    CONSTRAINT valid_extraction_method CHECK (extraction_method IN ('native_pdf', 'ocr_tesseract', 'ocr_cloud', 'manual'))
);

CREATE INDEX idx_documents_job_id ON documents(job_id);
CREATE INDEX idx_documents_storage_key ON documents(storage_key);
CREATE INDEX idx_documents_expires_at ON documents(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_documents_extracted_text_gin ON documents USING gin(to_tsvector('english', extracted_text));

-- RESULTS TABLE (AI analysis outputs)
CREATE TABLE results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    tier VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ai_model_version VARCHAR(100) NOT NULL, -- gpt-4-turbo-2024-01-01
    prompt_version VARCHAR(50) NOT NULL, -- v1.2.3
    raw_ai_response JSONB NOT NULL, -- full structured output
    summary TEXT NOT NULL, -- plain English summary
    scope_of_work JSONB, -- structured scope
    cost_breakdown JSONB, -- only for paid tiers
    red_flags JSONB, -- only for paid tiers
    recommendations JSONB, -- only for paid tiers
    comparison_data JSONB, -- only for premium
    confidence_score NUMERIC(5,2), -- 0-100
    processing_time_ms INTEGER,
    token_usage JSONB, -- {prompt: X, completion: Y, total: Z}
    expires_at TIMESTAMP WITH TIME ZONE, -- auto-delete date
    CONSTRAINT valid_tier CHECK (tier IN ('free', 'standard', 'premium'))
);

CREATE INDEX idx_results_job_id ON results(job_id);
CREATE INDEX idx_results_tier ON results(tier);
CREATE INDEX idx_results_created_at ON results(created_at);
CREATE INDEX idx_results_expires_at ON results(expires_at) WHERE expires_at IS NOT NULL;

-- PAYMENTS TABLE
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'AUD',
    status VARCHAR(50) NOT NULL, -- pending, succeeded, failed, refunded
    tier VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    succeeded_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    metadata JSONB DEFAULT '{}',
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    CONSTRAINT valid_tier CHECK (tier IN ('standard', 'premium'))
);

CREATE INDEX idx_payments_job_id ON payments(job_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- SUPPLIERS TABLE (internal intelligence - NOT exposed)
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(500) NOT NULL,
    abn VARCHAR(20),
    normalized_name VARCHAR(500), -- for matching
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_quotes_seen INTEGER DEFAULT 0,
    risk_score NUMERIC(5,2), -- 0-100, internal only
    risk_factors JSONB, -- internal intelligence
    last_seen_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    CONSTRAINT abn_format CHECK (abn ~ '^[0-9]{11}$' OR abn IS NULL)
);

CREATE INDEX idx_suppliers_business_name ON suppliers(business_name);
CREATE INDEX idx_suppliers_abn ON suppliers(abn);
CREATE INDEX idx_suppliers_normalized_name ON suppliers(normalized_name);
CREATE INDEX idx_suppliers_risk_score ON suppliers(risk_score);

-- AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    event_type VARCHAR(100) NOT NULL, -- payment_succeeded, account_deleted, etc.
    actor_type VARCHAR(50) NOT NULL, -- user, admin, system
    actor_id UUID,
    resource_type VARCHAR(50), -- job, document, payment
    resource_id UUID,
    action VARCHAR(100) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    severity VARCHAR(20) DEFAULT 'info', -- info, warning, error, critical
    CONSTRAINT valid_actor_type CHECK (actor_type IN ('user', 'admin', 'system', 'webhook')),
    CONSTRAINT valid_severity CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_resource_type_id ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);

-- FUNCTIONS & TRIGGERS

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Prevent modification of completed jobs
CREATE OR REPLACE FUNCTION prevent_completed_job_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
        RAISE EXCEPTION 'Cannot modify completed job';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_job_modification BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION prevent_completed_job_modification();

-- COMMENTS
COMMENT ON TABLE users IS 'Registered users with accounts';
COMMENT ON TABLE leads IS 'Email captures before account creation';
COMMENT ON TABLE jobs IS 'Quote analysis requests';
COMMENT ON TABLE documents IS 'Uploaded PDF files';
COMMENT ON TABLE results IS 'AI analysis outputs (tier-gated)';
COMMENT ON TABLE payments IS 'Stripe payment records';
COMMENT ON TABLE suppliers IS 'Internal supplier intelligence - NEVER expose publicly';
COMMENT ON TABLE audit_logs IS 'Audit trail for compliance';

COMMENT ON COLUMN documents.extracted_text IS 'DO NOT LOG - contains sensitive quote content';
COMMENT ON COLUMN suppliers.risk_score IS 'INTERNAL ONLY - never expose to users';