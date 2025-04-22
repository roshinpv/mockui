package com.wiremock.ui.controller;

import com.wiremock.ui.model.SoapStub;
import com.wiremock.ui.service.SoapStubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/soap-stubs")
@RequiredArgsConstructor
public class SoapStubController {
    private final SoapStubService soapStubService;

    @PostMapping
    public ResponseEntity<?> createStub(@RequestBody SoapStub stub) {
        try {
            return ResponseEntity.ok(soapStubService.createStub(stub));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<SoapStub>> getAllStubs() {
        return ResponseEntity.ok(soapStubService.getAllStubs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStubById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(soapStubService.getStubById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStub(@PathVariable Long id, @RequestBody SoapStub stub) {
        try {
            return ResponseEntity.ok(soapStubService.updateStub(id, stub));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStub(@PathVariable Long id) {
        try {
            soapStubService.deleteStub(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/validate-wsdl")
    public ResponseEntity<?> validateWsdl(@RequestBody WsdlValidationRequest request) {
        try {
            soapStubService.validateWsdl(request.getUrl());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    private static class WsdlValidationRequest {
        private String url;
        public String getUrl() { return url; }
        public void setUrl(String url) { this.url = url; }
    }
}