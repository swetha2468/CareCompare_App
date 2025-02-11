package com.carecompare.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "insurance_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InsurancePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id") // Matches schema.sql
    private Long planId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false) // Foreign key to users table
    private User user;

    @Column(name = "insurance_name", nullable = false)
    private String insuranceName;

    @Column(name = "plan_name", nullable = false)
    private String planName;

    @Column(name = "deductible", nullable = false)
    private Double deductible;

    @Column(name = "covered_treatments", columnDefinition = "TEXT")
    private String coveredTreatments;
}
