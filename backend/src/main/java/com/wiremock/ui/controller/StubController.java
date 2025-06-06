package com.wiremock.ui.controller;

import com.wiremock.ui.dto.StubRequest;
import com.wiremock.ui.model.Stub;
import com.wiremock.ui.service.StubService;
import com.wiremock.ui.util.JsonUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/stubs")
@RequiredArgsConstructor
public class StubController {
    private final StubService stubService;
    private final JsonUtils jsonUtils;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<Stub> createStub(@RequestBody StubRequest stubRequest) {
        log.info("Creating stub: {}", stubRequest.getName());
        
        // Convert to Stub entity
        Stub stub = new Stub();
        stub.setName(stubRequest.getName());
        
        try {
            // Convert request and response to JSON strings
            stub.setRequest(objectMapper.writeValueAsString(stubRequest.getRequest()));
            stub.setResponse(objectMapper.writeValueAsString(stubRequest.getResponse()));
        } catch (Exception e) {
            log.error("Error converting request/response to JSON: {}", e.getMessage(), e);
            // Set defaults if there's an error
            stub.setRequest("{}");
            stub.setResponse("{}");
        }
        
        stub.setPriority(stubRequest.getPriority());
        stub.setScenarioName(stubRequest.getScenarioName());
        stub.setRequiredScenarioState(stubRequest.getRequiredScenarioState());
        stub.setNewScenarioState(stubRequest.getNewScenarioState());
        stub.setPersistent(stubRequest.getPersistent() != null ? stubRequest.getPersistent() : false);
        stub.setEnabled(stubRequest.getEnabled() != null ? stubRequest.getEnabled() : true);
        
        // Convert metadata to string if it exists
        if (stubRequest.getMetadata() != null) {
            try {
                stub.setMetadata(objectMapper.writeValueAsString(stubRequest.getMetadata()));
            } catch (Exception e) {
                log.error("Error converting metadata to JSON: {}", e.getMessage(), e);
                stub.setMetadata("{}");
            }
        } else {
            stub.setMetadata("{}");
        }
        
        return ResponseEntity.ok(stubService.createStub(stub));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllStubs() {
        List<Stub> stubs = stubService.getAllStubs();
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
            
            // Parse the request/response/metadata strings into JsonNodes for the UI, handling double serialization
            stubMap.put("request", parsePossiblyDoubleEncodedJson(stub.getRequest(), "request", stub.getId()));
            stubMap.put("response", processResponseNode(parsePossiblyDoubleEncodedJson(stub.getResponse(), "response", stub.getId()), stub.getId()));
            stubMap.put("metadata", parsePossiblyDoubleEncodedJson(stub.getMetadata(), "metadata", stub.getId()));
            
            result.add(stubMap);
        }
        
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getStubById(@PathVariable String id) {
        Stub stub = stubService.getStubById(id);
        Map<String, Object> stubMap = new HashMap<>();
        
        stubMap.put("id", stub.getId());
        stubMap.put("name", stub.getName());
        stubMap.put("priority", stub.getPriority());
        stubMap.put("scenarioName", stub.getScenarioName());
        stubMap.put("requiredScenarioState", stub.getRequiredScenarioState());
        stubMap.put("newScenarioState", stub.getNewScenarioState());
        stubMap.put("persistent", stub.isPersistent());
        stubMap.put("enabled", stub.isEnabled());
        
        // Parse the request/response/metadata strings into JsonNodes for the UI, handling double serialization
        stubMap.put("request", parsePossiblyDoubleEncodedJson(stub.getRequest(), "request", stub.getId()));
        stubMap.put("response", processResponseNode(parsePossiblyDoubleEncodedJson(stub.getResponse(), "response", stub.getId()), stub.getId()));
        stubMap.put("metadata", parsePossiblyDoubleEncodedJson(stub.getMetadata(), "metadata", stub.getId()));
        
        return ResponseEntity.ok(stubMap);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Stub> updateStub(@PathVariable String id, @RequestBody StubRequest stubRequest) {
        log.info("Updating stub with ID: {}", id);
        
        // Convert to Stub entity
        Stub stub = new Stub();
        stub.setName(stubRequest.getName());
        
        try {
            // Convert request and response to JSON strings
            stub.setRequest(objectMapper.writeValueAsString(stubRequest.getRequest()));
            stub.setResponse(objectMapper.writeValueAsString(stubRequest.getResponse()));
        } catch (Exception e) {
            log.error("Error converting request/response to JSON: {}", e.getMessage(), e);
            // Set defaults if there's an error
            stub.setRequest("{}");
            stub.setResponse("{}");
        }
        
        stub.setPriority(stubRequest.getPriority());
        stub.setScenarioName(stubRequest.getScenarioName());
        stub.setRequiredScenarioState(stubRequest.getRequiredScenarioState());
        stub.setNewScenarioState(stubRequest.getNewScenarioState());
        stub.setPersistent(stubRequest.getPersistent() != null ? stubRequest.getPersistent() : false);
        stub.setEnabled(stubRequest.getEnabled() != null ? stubRequest.getEnabled() : true);
        
        // Convert metadata to string if it exists
        if (stubRequest.getMetadata() != null) {
            try {
                stub.setMetadata(objectMapper.writeValueAsString(stubRequest.getMetadata()));
            } catch (Exception e) {
                log.error("Error converting metadata to JSON: {}", e.getMessage(), e);
                stub.setMetadata("{}");
            }
        } else {
            stub.setMetadata("{}");
        }
        
        return ResponseEntity.ok(stubService.updateStub(id, stub));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStub(@PathVariable String id) {
        stubService.deleteStub(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Parses a string that might contain single- or double-encoded JSON.
     * If the string is empty or null, returns an empty ObjectNode.
     * If parsing fails at any stage, logs an error and returns an empty ObjectNode.
     */
    private JsonNode parsePossiblyDoubleEncodedJson(String jsonString, String fieldName, String stubId) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return objectMapper.createObjectNode();
        }
        
        try {
            JsonNode firstPassNode = objectMapper.readTree(jsonString);
            
            // Check if the first pass resulted in a TextNode (potential double encoding)
            if (firstPassNode.isTextual()) {
                try {
                    // Try parsing the content of the TextNode
                    return objectMapper.readTree(firstPassNode.textValue());
                } catch (Exception e2) {
                    log.warn("Could not parse inner JSON for stub {} field '{}' after first pass resulted in TextNode. Content: '{}'. Error: {}", 
                             stubId, fieldName, firstPassNode.textValue(), e2.getMessage());
                    // Return the TextNode itself if the second parse fails
                    return firstPassNode; 
                }
            }
            
            // If the first pass was successful and not a TextNode, return it
            return firstPassNode;
            
        } catch (Exception e1) {
            log.error("Error parsing initial JSON for stub {} field '{}'. Content: '{}'. Error: {}", 
                      stubId, fieldName, jsonString, e1.getMessage());
            // Return an empty node if the initial parse fails
            return objectMapper.createObjectNode();
        }
    }

    /**
     * Processes the response JsonNode to handle cases where the 'body' field might be 
     * a string containing escaped JSON.
     */
    private JsonNode processResponseNode(JsonNode responseNode, String stubId) {
        if (responseNode != null && responseNode.isObject() && responseNode.has("body") && responseNode.get("body").isTextual()) {
            String bodyText = responseNode.get("body").textValue();
            try {
                // Try parsing the body text as JSON
                JsonNode innerBodyNode = objectMapper.readTree(bodyText);
                // If successful, replace the text node with the parsed node
                ((ObjectNode) responseNode).set("body", innerBodyNode);
                log.debug("Successfully parsed inner JSON in response body for stub {}", stubId);
            } catch (Exception e) {
                // If parsing the inner body fails, log it but leave the original TextNode body
                log.warn("Could not parse response body text as JSON for stub {}. Body text: '{}'. Error: {}", 
                         stubId, bodyText, e.getMessage());
            }
        }
        return responseNode;
    }
}