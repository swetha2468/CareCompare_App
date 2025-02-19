-- Insert sample users
INSERT INTO users (name, email, password_hash) 
VALUES 
    ('Swetha Sajjala', 'swetha.sajjala13@gmail.com', '$2a$10$rWXv.KfHNcluqp6XGGJ26ulf9IiZtBIWc2he1OdwS37A72Y2cOnJ'),
    ('Swathi Thota', 'swathithota1@gmail.com', '$2a$10$i.6SVN2HYy5sXwC5UrSVu.pI7hzm38bgSOd3TIH6Doi7iBDVvFYCK')
ON CONFLICT (email) DO NOTHING;

-- Insert insurance plans for users
INSERT INTO insurance_plans (user_id, insurance_name, plan_name, deductible, covered_treatments) VALUES
(1, 'Health Shield', 'Premium Care', 500.00, 'General Checkup, Surgery, Dental'),
(1, 'MediCare Plus', 'Gold Plan', 1000.00, 'Hospitalization, Specialist Consultation'),
(2, 'Wellness First', 'Silver Plan', 750.00, 'Emergency Services, Mental Health, Therapy');
