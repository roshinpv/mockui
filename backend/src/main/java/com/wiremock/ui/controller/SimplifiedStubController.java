package com.wiremock.ui.controller;

import com.github.tomakehurst.wiremock.client.MappingBuilder;
import com.github.tomakehurst.wiremock.client.ResponseDefinitionBuilder;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.stubbing.StubMapping;
import com.wiremock.ui.model.Stub;
import com.wiremock.ui.repository.StubRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/simple-stubs")
@RequiredArgsConstructor
public class SimplifiedStubController {
    private final StubRepository stubRepository;
    private final WireMockServer wireMockServer;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<Map<String, Object>> createStub(@RequestBody Map<String, Object> request) {
        try {
            log.info("Creating simplified stub with: {}", request);
            
            // Extract basic fields
            String name = (String) request.getOrDefault("name", "Unnamed Stub");
            Integer priority = request.containsKey("priority") ? 
                Integer.valueOf(request.get("priority").toString()) : 0;
            Boolean enabled = (Boolean) request.getOrDefault("enabled", true);
            
            // Extract request details
            Map<String, Object> requestDetails = (Map<String, Object>) request.get("request");
            String method = requestDetails != null ? (String) requestDetails.getOrDefault("method", "GET") : "GET";
            String url = requestDetails != null ? (String) requestDetails.getOrDefault("url", "/") : "/";
            
            // Extract response details
            Map<String, Object> responseDetails = (Map<String, Object>) request.get("response");
            Integer status = responseDetails != null ? 
                Integer.valueOf(responseDetails.getOrDefault("status", 200).toString()) : 200;
            String body = responseDetails != null ? 
                (String) responseDetails.getOrDefault("body", "") : "";
            
            // Create WireMock stub directly
            MappingBuilder mappingBuilder;
            if ("GET".equalsIgnoreCase(method)) {
                mappingBuilder = WireMock.get(WireMock.urlPathEqualTo(url));
            } else if ("POST".equalsIgnoreCase(method)) {
                mappingBuilder = WireMock.post(WireMock.urlPathEqualTo(url));
            } else if ("PUT".equalsIgnoreCase(method)) {
                mappingBuilder = WireMock.put(WireMock.urlPathEqualTo(url));
            } else if ("DELETE".equalsIgnoreCase(method)) {
                mappingBuilder = WireMock.delete(WireMock.urlPathEqualTo(url));
            } else {
                mappingBuilder = WireMock.any(WireMock.urlPathEqualTo(url));
            }
            
            // Create response
            ResponseDefinitionBuilder responseBuilder = WireMock.aResponse()
                .withStatus(status)
                .withBody(body);
                
            // Headers from response details
            if (responseDetails != null && responseDetails.containsKey("headers")) {
                Map<String, Object> headers = (Map<String, Object>) responseDetails.get("headers");
                if (headers != null) {
                    headers.forEach((key, value) -> responseBuilder.withHeader(key, value.toString()));
                }
            }
            
            StubMapping stubMapping = mappingBuilder.willReturn(responseBuilder).build();
            
            // Give the stub a UUID if it doesn't have one
            if (stubMapping.getId() == null) {
                stubMapping.setId(UUID.randomUUID());
            }
            
            // Add to WireMock server
            wireMockServer.addStubMapping(stubMapping);
            
            // Create and save stub entity
            Stub stub = new Stub();
            stub.setName(name);
            stub.setPriority(priority);
            stub.setEnabled(enabled);
            
            // Convert the WireMock objects to JSON strings for storage
            stub.setRequest(objectMapper.writeValueAsString(requestDetails));
            stub.setResponse(objectMapper.writeValueAsString(responseDetails));
            
            // Add metadata about the actual WireMock stub ID
            Map<String, Object> metadataMap = new HashMap<>();
            metadataMap.put("wireMockId", stubMapping.getId().toString());
            stub.setMetadata(objectMapper.writeValueAsString(metadataMap));
            
            Stub savedStub = stubRepository.save(stub);
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("id", savedStub.getId());
            response.put("name", savedStub.getName());
            response.put("wireMockId", stubMapping.getId().toString());
            response.put("status", "success");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error creating simplified stub: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Stub>> getAllStubs() {
        return ResponseEntity.ok(stubRepository.findAll());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteStub(@PathVariable String id) {
        try {
            Stub stub = stubRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stub not found"));
            
            // Try to remove from WireMock
            try {
                if (stub.getMetadata() != null && !stub.getMetadata().isEmpty()) {
                    Map<String, Object> metadataMap = objectMapper.readValue(stub.getMetadata(), HashMap.class);
                    if (metadataMap.containsKey("wireMockId")) {
                        String wireMockId = (String) metadataMap.get("wireMockId");
                        wireMockServer.removeStubMapping(UUID.fromString(wireMockId));
                    }
                }
            } catch (Exception e) {
                log.warn("Could not remove WireMock mapping: {}", e.getMessage());
                // Continue with deletion from database
            }
            
            stubRepository.delete(stub);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Stub deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting stub: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
} 