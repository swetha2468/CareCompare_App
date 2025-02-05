-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Create Insurance Plans Table
CREATE TABLE IF NOT EXISTS insurance_plans (
    plan_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    insurance_name VARCHAR(255) NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    deductible DECIMAL NOT NULL,
    covered_treatments TEXT
);

-- Create Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
    hospital_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255),
    accepted_insurances TEXT,
    avg_treatment_cost DECIMAL
);

-- Create Treatments Table
CREATE TABLE IF NOT EXISTS treatments (
    treatment_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    avg_cost DECIMAL NOT NULL,
    hospital_id INT REFERENCES hospitals(hospital_id),
    covered_by TEXT
);
