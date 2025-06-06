package com.wiremock.ui.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class JsonUtils {
    
    private final ObjectMapper objectMapper;
    
    public JsonUtils(ObjectMapper mapper) {
        // Create a new mapper that doesn't have the same configuration
        // This helps avoid circular reference issues
        this.objectMapper = new ObjectMapper()
            .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS)
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
    
    /**
     * Converts a JSON string to a JsonNode
     */
    public JsonNode toJsonNode(String json) {
        if (json == null || json.trim().isEmpty()) {
            return objectMapper.createObjectNode();
        }
        
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert string to JsonNode: {}", e.getMessage(), e);
            // Return an empty object node instead of throwing an exception
            return objectMapper.createObjectNode();
        }
    }
    
    /**
     * Converts a JsonNode to a string
     */
    public String toString(JsonNode node) {
        if (node == null) {
            return "{}";
        }
        
        try {
            return objectMapper.writeValueAsString(node);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert JsonNode to string: {}", e.getMessage(), e);
            return "{}";
        }
    }
    
    /**
     * Creates a JsonNode from an object
     */
    public JsonNode toJsonNode(Object obj) {
        if (obj == null) {
            return objectMapper.createObjectNode();
        }
        
        // Direct conversion without intermediate steps to avoid circular references
        if (obj instanceof JsonNode) {
            return (JsonNode) obj;
        }
        
        try {
            // Convert to string first to break circular references
            String json = objectMapper.writeValueAsString(obj);
            return objectMapper.readTree(json);
        } catch (Exception e) {
            log.error("Failed to convert object to JsonNode: {}", e.getMessage(), e);
            return objectMapper.createObjectNode();
        }
    }
    
    /**
     * Converts a JsonNode to an object of the specified type
     */
    public <T> T toObject(JsonNode node, Class<T> clazz) {
        if (node == null) {
            try {
                return clazz.getDeclaredConstructor().newInstance();
            } catch (Exception e) {
                log.error("Failed to instantiate class: {}", e.getMessage(), e);
                return null;
            }
        }
        
        try {
            // Convert to string first to break circular references
            String json = objectMapper.writeValueAsString(node);
            return objectMapper.readValue(json, clazz);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert JsonNode to object: {}", e.getMessage(), e);
            return null;
        }
    }
} 