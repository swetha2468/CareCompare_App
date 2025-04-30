-- Create tables in proper order to avoid reference issues
-- First drop tables in order from most dependent to least dependent
DROP TABLE IF EXISTS treatment;
DROP TABLE IF EXISTS medical_record;
DROP TABLE IF EXISTS appointment;
DROP TABLE IF EXISTS hospital_insurance;
DROP TABLE IF EXISTS user_profile;
DROP TABLE IF EXISTS "user";
DROP TABLE IF EXISTS hospital;
DROP TABLE IF EXISTS insurance_plan;

-- Now create tables in order from least dependent to most dependent
-- First, create tables with no dependencies
CREATE TABLE insurance_plan (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    provider VARCHAR(255),
    coverage TEXT,
    benefits TEXT,
    policy_number VARCHAR(255) UNIQUE
);

CREATE TABLE hospital (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    zip_code VARCHAR(20),
    phone VARCHAR(20),
    website VARCHAR(255),
    rating FLOAT,
    contact VARCHAR(255)
);

-- Then create tables that depend on the above tables
CREATE TABLE "user" (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    address TEXT,
    date_of_birth VARCHAR(20),
    policy_number VARCHAR(255),
    insurance_plan_id BIGINT REFERENCES insurance_plan(id)
);

CREATE TABLE hospital_insurance (
    hospital_id BIGINT REFERENCES hospital(id),
    insurance_id BIGINT REFERENCES insurance_plan(id),
    PRIMARY KEY (hospital_id, insurance_id)
);

-- Finally create tables that depend on the above tables
CREATE TABLE user_profile (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    user_id BIGINT UNIQUE REFERENCES "user"(id)
);

CREATE TABLE appointment (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES "user"(id),
    hospital_id BIGINT REFERENCES hospital(id),
    doctor VARCHAR(255),
    specialty VARCHAR(255),
    date TIMESTAMP,
    time VARCHAR(50),
    description TEXT
);

CREATE TABLE medical_record (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES "user"(id),
    diagnosis TEXT,
    date TIMESTAMP
);

CREATE TABLE treatment (
    id BIGSERIAL PRIMARY KEY,
    medical_record_id BIGINT REFERENCES medical_record(id),
    treatment_name TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP
);