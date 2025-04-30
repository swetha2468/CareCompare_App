package com.carecompare.service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.carecompare.model.Hospital;
import com.carecompare.model.InsurancePlan;
import com.carecompare.repository.HospitalRepository;

@Service
public class HospitalService {
    @Autowired
    private HospitalRepository hospitalRepository;
    @Autowired
    private InsurancePlanService insurancePlanService; // Ensure this is injected

    private final RestTemplate restTemplate = new RestTemplate();
    private final String API_BASE_URL = "https://www.communitybenefitinsight.org/api/get_hospitals.php";

    public List<Hospital> findAll() {
        // Combine mock data with real API data
        List<Hospital> mockHospitals = hospitalRepository.findAll();
        List<Hospital> apiHospitals = fetchHospitalsFromAPI("NC"); 
        
        // Combine both lists
        List<Hospital> allHospitals = new ArrayList<>(mockHospitals);
        allHospitals.addAll(apiHospitals);
        
        return allHospitals;
    }
    
    public List<Hospital> findByState(String state) {
        // Combine mock data with real API data for the specified state
        List<Hospital> mockHospitals = hospitalRepository.findByStateContainingIgnoreCase(state);
        List<Hospital> apiHospitals = fetchHospitalsFromAPI(state);
        
        // Combine both lists
        List<Hospital> allHospitals = new ArrayList<>(mockHospitals);
        allHospitals.addAll(apiHospitals);
        
        return allHospitals;
    }

    public Optional<Hospital> findById(Long id) {
        return hospitalRepository.findById(id);
    }

    public Hospital save(Hospital hospital) {
        return hospitalRepository.save(hospital);
    }

    public void delete(Long id) {
        hospitalRepository.deleteById(id);
    }

    
    public List<Hospital> findHospitalsByPolicyNumber(String policyNumber) {
        Optional<InsurancePlan> planOptional = insurancePlanService.findByPolicyNumber(policyNumber);
        if (planOptional.isPresent()) {
            return hospitalRepository.findByAcceptedPlansContaining(planOptional.get());
        }
        return List.of();
    }

    public List<Hospital> search(String name, String city, String state, String zipCode) {
        
        List<Hospital> mockHospitals = hospitalRepository.findAll();
        List<Hospital> apiHospitals = state != null ? fetchHospitalsFromAPI(state) : fetchHospitalsFromAPI("NC");
        
        
        List<Hospital> allHospitals = new ArrayList<>(mockHospitals);
        allHospitals.addAll(apiHospitals);
        
        
        return allHospitals.stream()
            .filter(hospital -> name == null || hospital.getName().toLowerCase().contains(name.toLowerCase()))
            .filter(hospital -> city == null || (hospital.getCity() != null && hospital.getCity().toLowerCase().contains(city.toLowerCase())))
            .filter(hospital -> state == null || (hospital.getState() != null && hospital.getState().toLowerCase().contains(state.toLowerCase())))
            .filter(hospital -> zipCode == null || (hospital.getZipCode() != null && hospital.getZipCode().contains(zipCode)))
            .collect(Collectors.toList());
    }

    private List<Hospital> fetchHospitalsFromAPI(String state) {
        try {
            // Make API request to fetch hospitals by state
            String url = API_BASE_URL + "?state=" + state;
            HospitalApiResponse[] response = restTemplate.getForObject(url, HospitalApiResponse[].class);
            
            if (response == null) {
                return new ArrayList<>();
            }
            
            // Convert API response to Hospital entities
            return Arrays.stream(response)
                    .map(this::convertToHospital)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            // Log the error and return empty list if API call fails
            System.err.println("Error fetching hospitals from API: " + e.getMessage());
            return new ArrayList<>();
        }
    }
    
    private Hospital convertToHospital(HospitalApiResponse apiHospital) {
        Hospital hospital = new Hospital();
        // Use negative IDs for API hospitals to avoid collision with local DB IDs
        hospital.setId(Long.parseLong("-" + apiHospital.getHospitalId()));
        hospital.setName(apiHospital.getName());
        hospital.setAddress(apiHospital.getStreetAddress());
        hospital.setCity(apiHospital.getCity());
        hospital.setState(apiHospital.getState());
        hospital.setZipCode(apiHospital.getZipCode());
        
        // Set some default values for fields not provided by the API
        hospital.setPhone("(555) 123-4567"); // Default phone
        hospital.setWebsite("https://hospital-" + apiHospital.getHospitalId() + ".example.com");
        hospital.setRating(3.5f); // Default rating
        
        return hospital;
    }
    
    // Inner class to map API response
    private static class HospitalApiResponse {
        private String hospital_id;
        private String name;
        private String street_address;
        private String city;
        private String state;
        private String zip_code;
        private String hospital_bed_count;
        
        public String getHospitalId() {
            return hospital_id;
        }
        
        public void setHospitalId(String hospital_id) {
            this.hospital_id = hospital_id;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getStreetAddress() {
            return street_address;
        }
        
        public void setStreetAddress(String street_address) {
            this.street_address = street_address;
        }
        
        public String getCity() {
            return city;
        }
        
        public void setCity(String city) {
            this.city = city;
        }
        
        public String getState() {
            return state;
        }
        
        public void setState(String state) {
            this.state = state;
        }
        
        public String getZipCode() {
            return zip_code;
        }
        
        public void setZipCode(String zip_code) {
            this.zip_code = zip_code;
        }
        
        public String getHospitalBedCount() {
            return hospital_bed_count;
        }
        
        public void setHospitalBedCount(String hospital_bed_count) {
            this.hospital_bed_count = hospital_bed_count;
        }
    }
}