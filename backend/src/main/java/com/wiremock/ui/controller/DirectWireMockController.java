package com.wiremock.ui.controller;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.MappingBuilder;
import com.github.tomakehurst.wiremock.client.ResponseDefinitionBuilder;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.stubbing.StubMapping;
import com.wiremock.ui.model.Stub;
import com.wiremock.ui.repository.StubRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/direct")
@RequiredArgsConstructor
public class DirectWireMockController {

    private final WireMockServer wireMockServer;
    private final StubRepository stubRepository;
    private final ObjectMapper objectMapper;
    
    @GetMapping("/ping")
    public Map<String, String> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "DirectWireMockController is up and running");
        return response;
    }
    
    @GetMapping("/stubs")
    public List<Map<String, Object>> getAllStubs() {
        log.info("Getting all stubs via direct controller");
        List<Stub> stubs = stubRepository.findAll();
        log.info("Found {} stubs in the database", stubs.size());
        
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (Stub stub : stubs) {
            Map<String, Object> stubMap = new HashMap<>();
            stubMap.put("id", stub.getId());
            stubMap.put("name", stub.getName());
            stubMap.put("priority", stub.getPriority());
            stubMap.put("scenarioName", stub.getScenarioName());
            stubMap.put("requiredScenarioState", stub.getRequiredScenarioState());
            stubMap.put("newScenarioState", stub.getNewScenarioState());
            stubMap.put("persistent", stub.isPersistent());
            stubMap.put("enabled", stub.isEnabled());
            
            // Parse the request/response strings into JsonNodes for the UI
            try {
                JsonNode requestNode = stub.getRequest() != null && !stub.getRequest().isEmpty() 
                    ? objectMapper.readTree(stub.getRequest()) 
                    : objectMapper.createObjectNode();
                stubMap.put("request", requestNode);
                
                JsonNode responseNode = stub.getResponse() != null && !stub.getResponse().isEmpty() 
                    ? objectMapper.readTree(stub.getResponse()) 
                    : objectMapper.createObjectNode();
                stubMap.put("response", responseNode);
                
                JsonNode metadataNode = stub.getMetadata() != null && !stub.getMetadata().isEmpty() 
                    ? objectMapper.readTree(stub.getMetadata()) 
                    : objectMapper.createObjectNode();
                stubMap.put("metadata", metadataNode);
            } catch (Exception e) {
                log.error("Error parsing JSON for stub {}: {}", stub.getId(), e.getMessage());
                // Create empty nodes for missing/invalid data
                stubMap.put("request", objectMapper.createObjectNode());
                stubMap.put("response", objectMapper.createObjectNode());
                stubMap.put("metadata", objectMapper.createObjectNode());
            }
            
            result.add(stubMap);
        }
        
        return result;
    }
    
    @PostMapping("/stubs")
    public Map<String, Object> createStub(@RequestBody Map<String, Object> requestBody) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Extract request and response info
            Map<String, Object> requestMap = (Map<String, Object>) requestBody.get("request");
            Map<String, Object> responseMap = (Map<String, Object>) requestBody.get("response");
            
            if (requestMap == null || responseMap == null) {
                throw new IllegalArgumentException("Request and response are required");
            }
            
            // Get method and URL
            String method = (String) requestMap.getOrDefault("method", "GET");
            String url = (String) requestMap.getOrDefault("url", "/");
            
            // Get response details
            int status = responseMap.containsKey("status") ? 
                Integer.parseInt(responseMap.get("status").toString()) : 200;
            String body = (String) responseMap.getOrDefault("body", "");
            
            // Create stub
            MappingBuilder requestBuilder;
            if ("GET".equalsIgnoreCase(method)) {
                requestBuilder = WireMock.get(WireMock.urlPathEqualTo(url));
            } else if ("POST".equalsIgnoreCase(method)) {
                requestBuilder = WireMock.post(WireMock.urlPathEqualTo(url));
            } else if ("PUT".equalsIgnoreCase(method)) {
                requestBuilder = WireMock.put(WireMock.urlPathEqualTo(url));
            } else if ("DELETE".equalsIgnoreCase(method)) {
                requestBuilder = WireMock.delete(WireMock.urlPathEqualTo(url));
            } else {
                requestBuilder = WireMock.any(WireMock.urlPathEqualTo(url));
            }
            
            ResponseDefinitionBuilder responseBuilder = WireMock.aResponse()
                .withStatus(status)
                .withBody(body);
            
            // Add headers if provided
            if (responseMap.containsKey("headers")) {
                Map<String, Object> headers = (Map<String, Object>) responseMap.get("headers");
                headers.forEach((key, value) -> responseBuilder.withHeader(key, value.toString()));
            }
            
            // Build the stub mapping
            StubMapping stubMapping = requestBuilder.willReturn(responseBuilder).build();
            
            // Ensure it has an ID
            if (stubMapping.getId() == null) {
                stubMapping.setId(UUID.randomUUID());
            }
            
            // Register with WireMock
            wireMockServer.addStubMapping(stubMapping);
            
            // Also save to repository
            Stub stub = new Stub();
            stub.setName((String) requestBody.getOrDefault("name", "Direct Stub " + stubMapping.getId().toString().substring(0, 8)));
            stub.setRequest(objectMapper.writeValueAsString(requestMap));
            stub.setResponse(objectMapper.writeValueAsString(responseMap));
            stub.setPriority(requestBody.containsKey("priority") ? 
                Integer.valueOf(requestBody.get("priority").toString()) : 0);
            stub.setEnabled(requestBody.containsKey("enabled") ? 
                Boolean.valueOf(requestBody.get("enabled").toString()) : true);
                
            // Save metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("wireMockId", stubMapping.getId().toString());
            stub.setMetadata(objectMapper.writeValueAsString(metadata));
            
            Stub savedStub = stubRepository.save(stub);
            
            // Build response
            response.put("id", savedStub.getId());
            response.put("wireMockId", stubMapping.getId().toString());
            response.put("url", url);
            response.put("method", method);
            response.put("status", "success");
        } catch (Exception e) {
            log.error("Error creating stub", e);
            response.put("status", "error");
            response.put("message", e.getMessage());
        }
        
        return response;
    }
    
    @GetMapping("/info")
    public Map<String, Object> getInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("port", wireMockServer.port());
        info.put("baseUrl", wireMockServer.baseUrl());
        info.put("isRunning", wireMockServer.isRunning());
        return info;
    }
} 