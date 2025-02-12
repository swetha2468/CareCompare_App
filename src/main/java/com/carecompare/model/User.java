package com.carecompare.model;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users") // Maps to the database table
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id") // Maps to schema.sql
    private Long userId;

    @Column(name = "name", nullable = false) // Matches schema.sql
    private String name;

    @Column(name = "email", unique = true, nullable = false) // Matches schema.sql
    private String email;

    @Column(name = "password_hash", nullable = false) // Matches schema.sql
    private String passwordHash;

    //  `@OneToMany` annotation usage
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<InsurancePlan> insurancePlans;
}
