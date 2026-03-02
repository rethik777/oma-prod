package com.example.OMA.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.OMA.Model.Credentials;
import com.example.OMA.Service.CredentialService;

@RestController
@RequestMapping("api/credential")
public class CredentialController {
    
    private final CredentialService credentialService;
    public CredentialController(CredentialService credentialService){
        this.credentialService = credentialService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody Credentials user) {
        credentialService.registerUser(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @GetMapping("/check")
    public String check(){
        return "Checked";
    }
}
