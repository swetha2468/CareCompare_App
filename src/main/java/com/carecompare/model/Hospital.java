package com.carecompare.model;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "hospital")

@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})

public class Hospital {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String address;
    private String city;
    private String state;
    
    @Column(name = "zip_code")
    private String zipCode;
    private String phone;
    private String website;
    private Float rating;
    private String contact;

    @ManyToMany
    @JoinTable(
        name = "hospital_insurance",
        joinColumns = @JoinColumn(name = "hospital_id"),
        inverseJoinColumns = @JoinColumn(name = "insurance_id")
    )
    private Set<InsurancePlan> acceptedPlans = new HashSet<>();

    
    public Hospital() {}

    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public Float getRating() {
        return rating;
    }

    public void setRating(Float rating) {
        this.rating = rating;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public Set<InsurancePlan> getAcceptedPlans() {
        return acceptedPlans;
    }

    public void setAcceptedPlans(Set<InsurancePlan> acceptedPlans) {
        this.acceptedPlans = acceptedPlans;
    }

    @Override
    public String toString() {
        return "Hospital{id=" + id + ", name='" + name + "', address='" + address + 
               "', city='" + city + "', state='" + state + "', zipCode='" + zipCode + 
               "', contact='" + contact + "', acceptedPlans=" + acceptedPlans.size() + "}";
    }
}