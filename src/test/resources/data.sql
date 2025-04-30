-- Insurance plans with different policy numbers
INSERT INTO insurance_plan (id, name, provider, coverage, benefits, policy_number) 
VALUES 
(1, 'Basic Plan', 'Blue Cross', 'Basic coverage - 70% coinsurance', 'Annual checkups, emergency care', 'BC001'),
(2, 'Premium Plan', 'Blue Cross', 'Premium coverage - 90% coinsurance', 'Full coverage including dental and vision', 'BC002'),
(3, 'Standard Plan', 'Aetna', 'Standard coverage - 80% coinsurance', 'Hospitalization, prescription drugs, specialist visits', 'AET100'),
(4, 'Gold Plan', 'UnitedHealth', 'Comprehensive coverage - 85% coinsurance', 'Low deductibles, mental health coverage', 'UHC500'),
(5, 'Silver Plan', 'Cigna', 'Mid-tier coverage - 75% coinsurance', 'Preventive care, maternity coverage', 'CIG250');

-- Hospitals with complete information
INSERT INTO hospital (id, name, address, city, state, zip_code, phone, website, rating, contact) 
VALUES 
(1, 'City General Hospital', '123 Main St', 'Raleigh', 'NC', '27601', '(919) 555-1234', 'https://cityhospital.example.com', 4.5, '(919) 555-1234'),
(2, 'Memorial Medical Center', '456 Oak Avenue', 'Charlotte', 'NC', '28202', '(704) 555-6789', 'https://memorialmed.example.com', 4.8, '(704) 555-6789'),
(3, 'University Health', '789 College Blvd', 'Durham', 'NC', '27708', '(919) 555-9876', 'https://universityhealth.example.com', 4.7, '(919) 555-9876'),
(4, 'Valley Regional Hospital', '101 River Road', 'Asheville', 'NC', '28801', '(828) 555-3456', 'https://valleyregional.example.com', 4.2, '(828) 555-3456'),
(5, 'Coastal Medical Center', '202 Beach Drive', 'Wilmington', 'NC', '28401', '(910) 555-7890', 'https://coastalmed.example.com', 4.0, '(910) 555-7890');

-- Users with various insurance plans (passwords are BCrypt hashed)
INSERT INTO "user" (id, username, password, email, policy_number, insurance_plan_id)
VALUES 
(101, 'johndoe', '$2a$10$6PFIHzB8.u64VRk6dHOc9OQo9mfJ9xQGlI/QUVPZsdS8GlJCg4Z8K', 'john.doe@example.com', 'BC001', 1),
(102, 'janedoe', '$2a$10$6PFIHzB8.u64VRk6dHOc9OQo9mfJ9xQGlI/QUVPZsdS8GlJCg4Z8K', 'jane.doe@example.com', 'BC002', 2),
(103, 'samsmith', '$2a$10$6PFIHzB8.u64VRk6dHOc9OQo9mfJ9xQGlI/QUVPZsdS8GlJCg4Z8K', 'sam.smith@example.com', 'AET100', 3),
(104, 'emilyjones', '$2a$10$6PFIHzB8.u64VRk6dHOc9OQo9mfJ9xQGlI/QUVPZsdS8GlJCg4Z8K', 'emily.jones@example.com', 'UHC500', 4),
(105, 'michaelbrown', '$2a$10$6PFIHzB8.u64VRk6dHOc9OQo9mfJ9xQGlI/QUVPZsdS8GlJCg4Z8K', 'michael.brown@example.com', 'CIG250', 5);

-- User profiles
INSERT INTO user_profile (id, first_name, last_name, phone, user_id) 
VALUES 
(101, 'John', 'Doe', '(555) 123-4567', 101),
(102, 'Jane', 'Doe', '(555) 234-5678', 102),
(103, 'Sam', 'Smith', '(555) 345-6789', 103),
(104, 'Emily', 'Jones', '(555) 456-7890', 104),
(105, 'Michael', 'Brown', '(555) 567-8901', 105);

-- Hospital insurance relationships (which hospitals accept which insurance plans)
INSERT INTO hospital_insurance (hospital_id, insurance_id)
VALUES 
(1, 1), (1, 2), (1, 3), -- City General accepts Blue Cross and Aetna plans
(2, 1), (2, 2), (2, 4), -- Memorial accepts Blue Cross and UnitedHealth
(3, 3), (3, 4), (3, 5), -- University Health accepts Aetna, UnitedHealth, and Cigna
(4, 2), (4, 4), (4, 5), -- Valley Regional accepts Blue Cross Premium, UnitedHealth, and Cigna
(5, 1), (5, 3), (5, 5); -- Coastal accepts Blue Cross Basic, Aetna, and Cigna

-- Appointments for different users with different hospitals and specialties
INSERT INTO appointment (id, user_id, hospital_id, doctor, specialty, date, time, description) 
VALUES 
(101, 101, 1, 'Dr. James Smith', 'Cardiology', '2025-04-20 10:00:00', '10:00 AM', 'Annual heart checkup'),
(102, 102, 2, 'Dr. Sarah Johnson', 'Dermatology', '2025-04-22 14:30:00', '2:30 PM', 'Skin examination'),
(103, 103, 3, 'Dr. Robert Williams', 'Neurology', '2025-04-25 09:15:00', '9:15 AM', 'Headache consultation'),
(104, 104, 4, 'Dr. Lisa Brown', 'Orthopedics', '2025-04-27 13:00:00', '1:00 PM', 'Knee pain evaluation'),
(105, 105, 5, 'Dr. Michael Davis', 'Gastroenterology', '2025-04-30 11:45:00', '11:45 AM', 'Digestive system checkup'),
(106, 101, 3, 'Dr. Emily Wilson', 'Ophthalmology', '2025-05-05 15:30:00', '3:30 PM', 'Annual eye examination'),
(107, 102, 4, 'Dr. David Miller', 'ENT', '2025-05-10 10:45:00', '10:45 AM', 'Sinus infection follow-up'),
(108, 103, 1, 'Dr. Karen Taylor', 'Endocrinology', '2025-05-15 09:00:00', '9:00 AM', 'Diabetes management');

-- Medical records for users
INSERT INTO medical_record (id, user_id, diagnosis, date)
VALUES 
(101, 101, 'Hypertension, well-controlled', '2025-03-15 10:30:00'),
(102, 102, 'Eczema on forearms', '2025-03-20 14:45:00'),
(103, 103, 'Migraine headaches', '2025-03-22 09:30:00'),
(104, 104, 'Osteoarthritis of the knee', '2025-03-25 13:15:00'),
(105, 105, 'Gastroesophageal reflux disease', '2025-03-28 12:00:00');

-- Treatments for medical records
INSERT INTO treatment (id, medical_record_id, treatment_name, start_date, end_date)
VALUES 
(101, 101, 'Lisinopril 10mg daily', '2025-03-15 00:00:00', '2025-09-15 00:00:00'),
(102, 102, 'Hydrocortisone cream 1% twice daily', '2025-03-20 00:00:00', '2025-04-10 00:00:00'),
(103, 103, 'Sumatriptan 50mg as needed', '2025-03-22 00:00:00', '2025-06-22 00:00:00'),
(104, 104, 'Physical therapy twice weekly', '2025-03-25 00:00:00', '2025-05-25 00:00:00'),
(105, 105, 'Omeprazole 20mg daily', '2025-03-28 00:00:00', '2025-06-28 00:00:00');

-- Reset sequences to avoid conflicts with auto-generated IDs
SELECT setval('insurance_plan_id_seq', 2000, true);
SELECT setval(pg_get_serial_sequence('"user"', 'id'), 2000, true);
SELECT setval('user_profile_id_seq', 2000, true);
SELECT setval('hospital_id_seq', 2000, true);
SELECT setval('appointment_id_seq', 2000, true);
SELECT setval('medical_record_id_seq', 2000, true);
SELECT setval('treatment_id_seq', 2000, true);