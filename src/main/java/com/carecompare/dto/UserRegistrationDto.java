package com.carecompare.dto;


public class UserRegistrationDto {
    private String username;
    private String password;
    private String email;
    private String policyNumber;
    
   
    public UserRegistrationDto() {}
 
    public UserRegistrationDto(String username, String password, String email, String policyNumber) {
        this.username = username;
        this.password = password;
        this.email = email;
        this.policyNumber = policyNumber;
    }
    
    
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPolicyNumber() {
        return policyNumber;
    }

    public void setPolicyNumber(String policyNumber) {
        this.policyNumber = policyNumber;
    }
} 
