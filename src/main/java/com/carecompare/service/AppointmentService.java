package com.carecompare.service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.stereotype.Service;

import com.carecompare.model.Appointment;
import com.carecompare.repository.AppointmentRepository;

@Service
public class AppointmentService {

    private static final Logger logger = LoggerFactory.getLogger(AppointmentService.class);

    @Autowired
    private AppointmentRepository appointmentRepository;

    public List<Appointment> findAll() {
        return appointmentRepository.findAll();
    }

    public Optional<Appointment> findById(Long id) {
        return appointmentRepository.findById(id);
    }

    public Appointment save(Appointment appointment) {
        logger.debug("Saving appointment: {}", appointment);
        return appointmentRepository.save(appointment);
    }

    public void delete(Long id) {
        try {
            logger.info("Attempting to delete appointment with id: {}", id);
            appointmentRepository.deleteById(id);
            logger.info("Successfully deleted appointment with id: {}", id);
        } catch (EmptyResultDataAccessException e) {
            logger.warn("Appointment with id {} not found during deletion", id, e);
            throw new IllegalArgumentException("Appointment not found with id: " + id, e);
        } catch (Exception e) {
            logger.error("Failed to delete appointment with id: {}. Error: {}", id, e.getMessage(), e);
            throw new RuntimeException("Failed to delete appointment due to server error", e);
        }
    }

    public List<Appointment> findByUserId(Long userId) {
        return appointmentRepository.findByUserId(userId);
    }

    public Appointment bookAppointment(Appointment appointment) {
        logger.info("Starting appointment booking process for: {}", appointment);
        try {
            validateAppointment(appointment);
            logger.info("Appointment validation successful");
            logger.info("Booking appointment for user ID: {}, hospital ID: {}, at: {}",
                    appointment.getUser().getId(), 
                    appointment.getHospital() != null ? appointment.getHospital().getId() : "null", 
                    appointment.getDate());
            return save(appointment);
        } catch (Exception e) {
            logger.error("Error during appointment booking", e);
            throw e;
        }
    }

    public List<Appointment> getAppointmentsByUserId(Long userId) {
        return findByUserId(userId);
    }

    private void validateAppointment(Appointment appointment) {
        logger.debug("Validating appointment: {}", appointment);
        
        if (appointment == null) {
            logger.error("Attempted to book a null appointment");
            throw new IllegalArgumentException("Appointment cannot be null");
        }
        
        if (appointment.getUser() == null || appointment.getUser().getId() == null) {
            logger.error("User ID is missing in appointment booking");
            throw new IllegalArgumentException("User ID is required");
        }
        
        if (appointment.getHospital() == null || appointment.getHospital().getId() == null) {
            logger.error("Hospital ID is missing in appointment booking: {}", 
                    appointment.getHospital() != null ? "Hospital object exists but ID is null" : "Hospital object is null");
            throw new IllegalArgumentException("Hospital ID is required");
        }
        
        if (appointment.getDate() == null) {
            logger.error("Appointment date is null");
            throw new IllegalArgumentException("Appointment date is required");
        }
        
        if (appointment.getDate().before(new Date())) {
            logger.error("Appointment date is in the past: {}", appointment.getDate());
            throw new IllegalArgumentException("Appointment date must be in the future");
        }
        
        if (appointment.getDoctor() == null || appointment.getDoctor().trim().isEmpty()) {
            logger.error("Doctor is missing or empty");
            throw new IllegalArgumentException("Doctor is required");
        }
        
        if (appointment.getSpecialty() == null || appointment.getSpecialty().trim().isEmpty()) {
            logger.error("Specialty is missing or empty");
            throw new IllegalArgumentException("Specialty is required");
        }
        
        logger.debug("Appointment validation completed successfully");
    }
}