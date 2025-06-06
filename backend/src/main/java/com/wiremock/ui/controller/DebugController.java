package com.wiremock.ui.controller;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.MappingBuilder;
import com.github.tomakehurst.wiremock.client.ResponseDefinitionBuilder;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.stubbing.StubMapping;
import com.wiremock.ui.model.Stub;
import com.wiremock.ui.util.JsonUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {
    
    private final ObjectMapper objectMapper;
    private final JsonUtils jsonUtils;
    private final WireMockServer wireMockServer;
    
    @PostMapping("/echo")
    public ResponseEntity<Map<String, Object>> echo(@RequestBody Map<String, Object> body) {
        log.info("Received: {}", body);
        return ResponseEntity.ok(body);
    }
    
    @PostMapping("/stub")
    public ResponseEntity<Map<String, Object>> debugStub(@RequestBody Stub stub) {
        log.info("Received stub: {}", stub);
        
        Map<String, Object> result = new HashMap<>();
        result.put("name", stub.getName());
        
        try {
            String requestStr = stub.getRequest();
            result.put("requestType", requestStr != null ? "String" : "null");
            result.put("request", requestStr);
            
            String responseStr = stub.getResponse();
            result.put("responseType", responseStr != null ? "String" : "null");
            result.put("response", responseStr);
            
            result.put("priority", stub.getPriority());
            result.put("enabled", stub.isEnabled());
            
            // Try to parse request and response as JSON for more detail
            try {
                if (requestStr != null && !requestStr.isEmpty()) {
                    JsonNode requestNode = objectMapper.readTree(requestStr);
                    result.put("requestParsed", requestNode);
                }
                
                if (responseStr != null && !responseStr.isEmpty()) {
                    JsonNode responseNode = objectMapper.readTree(responseStr);
                    result.put("responseParsed", responseNode);
                }
            } catch (Exception e) {
                log.warn("Could not parse request/response as JSON: {}", e.getMessage());
                result.put("parsingError", e.getMessage());
            }
            
            result.put("status", "success");
        } catch (Exception e) {
            log.error("Error processing stub: {}", e.getMessage(), e);
            result.put("status", "error");
            result.put("error", e.getMessage());
            result.put("stackTrace", e.getStackTrace()[0].toString());
        }
        
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/convert")
    public ResponseEntity<Map<String, Object>> convert(@RequestBody Map<String, Object> body) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            if (body.containsKey("request")) {
                Object request = body.get("request");
                result.put("requestConverted", objectMapper.writeValueAsString(request));
            }
            
            if (body.containsKey("response")) {
                Object response = body.get("response");
                result.put("responseConverted", objectMapper.writeValueAsString(response));
            }
            
            result.put("status", "success");
        } catch (Exception e) {
            log.error("Error converting: {}", e.getMessage(), e);
            result.put("status", "error");
            result.put("error", e.getMessage());
            result.put("stackTrace", e.getStackTrace()[0].toString());
        }
        
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/direct-stub")
    public ResponseEntity<Map<String, Object>> createDirectStub(@RequestBody Map<String, Object> request) {
        try {
            log.info("Creating direct stub with: {}", request);
            
            // Extract basic info
            String name = (String) request.getOrDefault("name", "Direct Stub");
            
            // Extract request details
            Map<String, Object> requestDetails = (Map<String, Object>) request.get("request");
            if (requestDetails == null) {
                throw new IllegalArgumentException("Request details are required");
            }
            
            String method = (String) requestDetails.getOrDefault("method", "GET");
            String url = (String) requestDetails.getOrDefault("url", "/");
            
            // Extract response details
            Map<String, Object> responseDetails = (Map<String, Object>) request.get("response");
            if (responseDetails == null) {
                throw new IllegalArgumentException("Response details are required");
            }
            
            Integer status = responseDetails.containsKey("status") ? 
                Integer.valueOf(responseDetails.get("status").toString()) : 200;
            String body = (String) responseDetails.getOrDefault("body", "");
            
            // Create a WireMock stub directly
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
            
            ResponseDefinitionBuilder responseBuilder = WireMock.aResponse()
                .withStatus(status)
                .withBody(body);
            
            // Add headers if present
            if (responseDetails.containsKey("headers")) {
                Map<String, Object> headers = (Map<String, Object>) responseDetails.get("headers");
                if (headers != null) {
                    headers.forEach((key, value) -> responseBuilder.withHeader(key, value.toString()));
                }
            }
            
            StubMapping stubMapping = mappingBuilder.willReturn(responseBuilder).build();
            
            // Ensure the stub has a UUID
            if (stubMapping.getId() == null) {
                stubMapping.setId(UUID.randomUUID());
            }
            
            // Register the stub with WireMock
            wireMockServer.addStubMapping(stubMapping);
            
            // Create the response
            Map<String, Object> response = new HashMap<>();
            response.put("name", name);
            response.put("id", stubMapping.getId().toString());
            response.put("url", url);
            response.put("method", method);
            response.put("status", "success");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating direct stub: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
} 