import axios from 'axios';

// Base URLs for APIs
const NPI_API_BASE_URL = 'https://clinicaltables.nlm.nih.gov/api/npi_org/v3/search';
const API_BASE_URL = 'http://localhost:8080/api/hospital';

// Hospital image sources - will rotate through these for different hospitals
const hospitalImages = [
    'https://images.unsplash.com/photo-1587351021759-3772687c673b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',  // Hospital building
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',  // Hospital entrance
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',  // Modern hospital
    'https://images.unsplash.com/photo-1578991624414-df750d75f751?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',  // Hospital ward
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',  // Medical center
    'https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',  // Hospital hallway
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',  // Hospital exterior
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60',  // Modern hospital building
];

// Generate a large set of mock data for hospitals
function generateMockHospitals(count = 100) {
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia',
        'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
        'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle',
        'Denver', 'Boston', 'Portland', 'Las Vegas'];

    const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'NC', 'WA', 'CO', 'MA', 'OR', 'NV'];

    const hospitalTypes = ['General', 'Community', 'University', 'Memorial', 'Regional', 'Children\'s',
        'Medical Center', 'Health Center', 'Specialty', 'Women\'s', 'Veterans'];

    const specialtySets = [
        ['Cardiology', 'Neurology', 'Oncology'],
        ['Neurology', 'Orthopedics', 'Pediatrics'],
        ['Cardiology', 'Dermatology', 'Gastroenterology'],
        ['Oncology', 'Gynecology', 'Ophthalmology'],
        ['Pediatrics', 'Orthopedics', 'Cardiology'],
        ['Dermatology', 'Neurology', 'Pediatrics'],
        ['Cardiology', 'Oncology', 'Emergency Medicine'],
        ['Orthopedics', 'Sports Medicine', 'Physical Therapy'],
        ['Pediatrics', 'Neonatology', 'Developmental Medicine'],
        ['Psychiatry', 'Psychology', 'Behavioral Health']
    ];

    const insuranceSets = [
        ['Blue Cross Blue Shield', 'Aetna', 'Medicare'],
        ['Cigna', 'Humana', 'Medicare', 'Medicaid'],
        ['Aetna', 'UnitedHealthcare', 'Kaiser Permanente'],
        ['Blue Cross Blue Shield', 'Medicare', 'Medicaid'],
        ['UnitedHealthcare', 'Cigna', 'Aetna'],
        ['Medicare', 'Medicaid', 'Humana', 'Blue Cross Blue Shield'],
        ['Kaiser Permanente', 'Blue Cross Blue Shield', 'UnitedHealthcare'],
        ['Aetna', 'Cigna', 'Medicare', 'Medicaid']
    ];

    const mockHospitals = [];

    for (let i = 1; i <= count; i++) {
        const cityIndex = Math.floor(Math.random() * cities.length);
        const city = cities[cityIndex];
        const state = states[Math.floor(Math.random() * states.length)];
        const zipCode = Math.floor(10000 + Math.random() * 90000).toString();

        const hospitalType = hospitalTypes[Math.floor(Math.random() * hospitalTypes.length)];
        const name = `${city} ${hospitalType} Hospital`;

        const specialtySetIndex = Math.floor(Math.random() * specialtySets.length);
        const insuranceSetIndex = Math.floor(Math.random() * insuranceSets.length);
        const imageIndex = i % hospitalImages.length;

        const rating = (Math.floor(Math.random() * 15) + 35) / 10; // Random rating between 3.5 and 5.0

        mockHospitals.push({
            id: i,
            name: name,
            address: `${Math.floor(Math.random() * 1999) + 1} ${['Main', 'Park', 'Oak', 'Pine', 'Maple', 'Elm', 'Cedar', 'Washington'][Math.floor(Math.random() * 8)]} ${['St', 'Ave', 'Blvd', 'Dr', 'Rd'][Math.floor(Math.random() * 5)]}`,
            city: city,
            state: state,
            zipCode: zipCode,
            phoneNumber: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
            website: `www.${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.org`,
            rating: rating,
            specialties: specialtySets[specialtySetIndex],
            insuranceAccepted: insuranceSets[insuranceSetIndex],
            imageUrl: hospitalImages[imageIndex]
        });
    }

    return mockHospitals;
}

// Generate a large dataset of mock hospitals
const mockHospitals = generateMockHospitals(100);

/**
 * Service for fetching hospital data from external APIs and our backend
 */
class HospitalService {
    /**
     * Fetch hospitals based on search criteria
     * @param {Object} searchParams - Search parameters (name, location, specialty, insurance)
     * @returns {Promise} - Promise resolving to hospital data
     */
    async searchHospitals(searchParams = {}) {
        // Use the generated mock data with images
        return this.filterMockHospitals(searchParams);

        /* 
        // Real API implementation - currently disabled in favor of rich mock data
        try {
          // Try using our backend API
          try {
            console.log('Trying backend API');
            const response = await axios.get(API_BASE_URL, { params: searchParams });
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              return this.formatHospitalsFromBackend(response.data);
            }
          } catch (error) {
            console.log('Backend API not available:', error);
          }
          
          // Try using the NPI API if our backend is not available
          try {
            let terms = [];
            if (searchParams.name) terms.push(searchParams.name);
            if (searchParams.location) terms.push(searchParams.location);
            
            // Use default search term if none provided
            if (terms.length === 0) terms.push('hospital');
            
            // Construct the query for the NPI API - request more results
            const params = {
              terms: terms.join(' '),
              maxList: 100, // Request up to 100 results
              df: 'name.full,addr_practice.full',
              ef: 'addr_practice.phone,addr_practice.fax,licenses.taxonomy.classification'
            };
            
            console.log('Fetching from NPI API with params:', params);
            const response = await axios.get(NPI_API_BASE_URL, { params });
            console.log('NPI API response:', response.data);
            
            if (response.data && Array.isArray(response.data[3]) && response.data[3].length > 0) {
              const formattedData = this.formatHospitalsFromNPI(response.data);
              if (formattedData && formattedData.length > 0) {
                return formattedData;
              }
            }
          } catch (error) {
            console.log('NPI API failed:', error);
          }
          
          // Fall back to mock data if both APIs fail
          console.log('Falling back to mock data');
          return this.filterMockHospitals(searchParams);
        } catch (error) {
          console.error('Error fetching hospitals:', error);
          return this.filterMockHospitals(searchParams);
        }
        */
    }

    /**
     * Filter mock hospitals based on search criteria
     * @param {Object} searchParams - Search parameters
     * @returns {Array} - Filtered mock hospital data
     */
    filterMockHospitals(searchParams = {}) {
        let filteredHospitals = [...mockHospitals];

        if (searchParams.name) {
            const nameSearch = searchParams.name.toLowerCase();
            filteredHospitals = filteredHospitals.filter(hospital =>
                hospital.name.toLowerCase().includes(nameSearch)
            );
        }

        if (searchParams.location) {
            const locationSearch = searchParams.location.toLowerCase();
            filteredHospitals = filteredHospitals.filter(hospital =>
                hospital.city.toLowerCase().includes(locationSearch) ||
                hospital.state.toLowerCase().includes(locationSearch) ||
                hospital.zipCode.includes(locationSearch)
            );
        }

        if (searchParams.specialty) {
            filteredHospitals = filteredHospitals.filter(hospital =>
                hospital.specialties.includes(searchParams.specialty)
            );
        }

        if (searchParams.insurance) {
            filteredHospitals = filteredHospitals.filter(hospital =>
                hospital.insuranceAccepted.includes(searchParams.insurance)
            );
        }

        return filteredHospitals;
    }

    /**
     * Format hospital data from our backend to the required format
     * @param {Array} data - Hospital data from backend
     * @returns {Array} - Formatted hospital data
     */
    formatHospitalsFromBackend(data) {
        return data.map((hospital, index) => ({
            id: hospital.id,
            name: hospital.name,
            address: hospital.address,
            city: hospital.city || '',
            state: hospital.state || '',
            zipCode: hospital.zipCode || '',
            phoneNumber: hospital.phoneNumber || '',
            website: hospital.website || '',
            rating: hospital.rating || 4.0, // Default rating if not available
            specialties: hospital.specialties || [],
            insuranceAccepted: hospital.acceptedPlans?.map(plan => plan.name) || [],
            imageUrl: hospitalImages[index % hospitalImages.length] // Add an image URL
        }));
    }

    /**
     * Format hospital data from the NPI API to the required format
     * @param {Array} data - Hospital data from NPI API
     * @returns {Array} - Formatted hospital data
     */
    formatHospitalsFromNPI(data) {
        console.log('Formatting NPI data');
        if (!data || !Array.isArray(data[3]) || data[3].length === 0) {
            console.log('No valid data in NPI response');
            return [];
        }

        // Predefined specialty sets for different hospitals
        const specialtySets = [
            ['Cardiology', 'Neurology', 'Oncology'],
            ['Neurology', 'Orthopedics', 'Pediatrics'],
            ['Cardiology', 'Dermatology', 'Gastroenterology'],
            ['Oncology', 'Gynecology', 'Ophthalmology'],
            ['Pediatrics', 'Orthopedics', 'Cardiology'],
            ['Dermatology', 'Neurology', 'Pediatrics']
        ];

        // Predefined insurance sets for different hospitals
        const insuranceSets = [
            ['Blue Cross Blue Shield', 'Aetna', 'Medicare'],
            ['Cigna', 'Humana', 'Medicare', 'Medicaid'],
            ['Aetna', 'UnitedHealthcare', 'Kaiser Permanente'],
            ['Blue Cross Blue Shield', 'Medicare', 'Medicaid'],
            ['UnitedHealthcare', 'Cigna', 'Aetna'],
            ['Medicare', 'Medicaid', 'Humana', 'Blue Cross Blue Shield']
        ];

        console.log(`Processing ${data[3].length} hospitals from NPI API`);
        return data[3].map((hospital, index) => {
            // Handle the case where hospital data might be incomplete
            if (!hospital || !Array.isArray(hospital) || hospital.length < 2) {
                console.log(`Invalid hospital data at index ${index}:`, hospital);

                // Return a default hospital if data is invalid
                return {
                    id: `default-${index}`,
                    name: `Hospital ${index + 1}`,
                    address: '123 Main St',
                    city: 'Anytown',
                    state: 'NY',
                    zipCode: '10001',
                    phoneNumber: '(123) 456-7890',
                    website: 'www.hospital.org',
                    rating: 4,
                    specialties: specialtySets[index % specialtySets.length],
                    insuranceAccepted: insuranceSets[index % insuranceSets.length],
                    imageUrl: hospitalImages[index % hospitalImages.length] // Add an image URL
                };
            }

            // Extract the name from the hospital data
            const name = hospital[0] || `Hospital ${index + 1}`;

            // Parse address parts from the full address string
            let address = '';
            let city = '';
            let state = '';
            let zipCode = '';

            if (hospital[1]) {
                const addressParts = hospital[1].split(', ');
                address = addressParts[0] || '';

                if (addressParts.length > 1) {
                    const location = addressParts[1];
                    const cityState = location.split(' ');

                    city = cityState.length > 1 ? cityState.slice(0, -1).join(' ') : '';
                    state = cityState.length > 1 ? cityState[cityState.length - 1] : '';
                }

                if (addressParts.length > 2) {
                    const zipParts = addressParts[2].split(' ');
                    zipCode = zipParts[0] || '';
                }
            }

            // Alternate specialty and insurance sets for different hospitals
            const specialtySetIndex = index % specialtySets.length;
            const insuranceSetIndex = index % insuranceSets.length;

            return {
                id: data[1][index] || `h${index}`,
                name: name,
                address: address,
                city: city,
                state: state,
                zipCode: zipCode,
                phoneNumber: data[2]?.addr_practice?.phone?.[index] || '(123) 456-7890',
                website: `www.${name.toLowerCase().replace(/\s+/g, '').replace(/[^\w-]+/g, '')}.org`,
                rating: Math.floor(Math.random() * 2) + 3, // Random rating between 3-5
                specialties: specialtySets[specialtySetIndex],
                insuranceAccepted: insuranceSets[insuranceSetIndex],
                imageUrl: hospitalImages[index % hospitalImages.length] // Add an image URL
            };
        });
    }
}

export default new HospitalService(); 