package com.wiremock.ui.service;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.MappingBuilder;
import com.github.tomakehurst.wiremock.client.ResponseDefinitionBuilder;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.github.tomakehurst.wiremock.extension.Parameters;
import com.github.tomakehurst.wiremock.http.RequestMethod;
import com.github.tomakehurst.wiremock.matching.*;
import com.github.tomakehurst.wiremock.stubbing.StubMapping;
import com.wiremock.ui.model.Stub;
import com.wiremock.ui.repository.StubRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StubService {
    private final StubRepository stubRepository;
    private final WireMockServer wireMockServer;
    private final ObjectMapper objectMapper;

    public Stub createStub(Stub stub) {
        // Set defaults for null fields
        if (stub.getRequest() == null) {
            stub.setRequest("{}");
        }
        
        if (stub.getResponse() == null) {
            stub.setResponse("{}");
        }
        
        if (stub.getMetadata() == null) {
            stub.setMetadata("{}");
        }
        
        Stub savedStub = stubRepository.save(stub);
        updateWireMockMapping(savedStub);
        return savedStub;
    }

    public List<Stub> getAllStubs() {
        return stubRepository.findAll();
    }

    public Stub getStubById(String id) {
        return stubRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Stub not found with ID: " + id));
    }

    public Stub updateStub(String id, Stub stub) {
        Stub existingStub = getStubById(id);
        
        existingStub.setName(stub.getName());
        existingStub.setRequest(stub.getRequest());
        existingStub.setResponse(stub.getResponse());
        existingStub.setPriority(stub.getPriority());
        existingStub.setScenarioName(stub.getScenarioName());
        existingStub.setRequiredScenarioState(stub.getRequiredScenarioState());
        existingStub.setNewScenarioState(stub.getNewScenarioState());
        existingStub.setPersistent(stub.isPersistent());
        existingStub.setEnabled(stub.isEnabled());
        existingStub.setMetadata(stub.getMetadata());
        
        if (stub.getRequest() == null) {
            existingStub.setRequest("{}");
        }
        
        if (stub.getResponse() == null) {
            existingStub.setResponse("{}");
        }
        
        if (stub.getMetadata() == null) {
            existingStub.setMetadata("{}");
        }
        
        Stub updatedStub = stubRepository.save(existingStub);
        updateWireMockMapping(updatedStub);
        return updatedStub;
    }

    public void deleteStub(String id) {
        Stub stub = getStubById(id);
        stubRepository.delete(stub);
        removeWireMockMapping(stub);
    }

    private void updateWireMockMapping(Stub stub) {
        try {
            // Create request matchers
            MappingBuilder requestBuilder = createRequestBuilder(stub);
            
            // Create response
            ResponseDefinitionBuilder responseBuilder = createResponseBuilder(stub);
            
            // Add scenario if specified
            if (stub.getScenarioName() != null && !stub.getScenarioName().isEmpty()) {
                requestBuilder.inScenario(stub.getScenarioName());
                
                if (stub.getRequiredScenarioState() != null && !stub.getRequiredScenarioState().isEmpty()) {
                    // NOTE: This may require API change if not available in the current version of WireMock
                    if (requestBuilder instanceof com.github.tomakehurst.wiremock.client.ScenarioMappingBuilder) {
                        ((com.github.tomakehurst.wiremock.client.ScenarioMappingBuilder) requestBuilder)
                            .whenScenarioStateIs(stub.getRequiredScenarioState());
                    }
                }
                
                if (stub.getNewScenarioState() != null && !stub.getNewScenarioState().isEmpty()) {
                    // NOTE: This may require API change if not available in the current version of WireMock
                    if (requestBuilder instanceof com.github.tomakehurst.wiremock.client.ScenarioMappingBuilder) {
                        ((com.github.tomakehurst.wiremock.client.ScenarioMappingBuilder) requestBuilder)
                            .willSetStateTo(stub.getNewScenarioState());
                    }
                }
            }
            
            // Apply priority if specified
            if (stub.getPriority() != null) {
                requestBuilder.atPriority(stub.getPriority());
            }
            
            // Create the mapping
            StubMapping mapping = requestBuilder.willReturn(responseBuilder).build();
            
            // Add the mapping to WireMock
            wireMockServer.addStubMapping(mapping);
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to update WireMock mapping", e);
        }
    }

    private MappingBuilder createRequestBuilder(Stub stub) throws Exception {
        JsonNode requestNode = parseJsonNode(stub.getRequest());
        String method = "GET";
        String url = "/";
        
        if (requestNode.has("method")) {
            method = requestNode.get("method").asText().toUpperCase();
        }
        
        if (requestNode.has("url")) {
            url = requestNode.get("url").asText();
        }
        
        MappingBuilder builder;
        
        switch (method) {
            case "GET":
                builder = WireMock.get(urlMatcherForPath(url, requestNode));
                break;
            case "POST":
                builder = WireMock.post(urlMatcherForPath(url, requestNode));
                break;
            case "PUT":
                builder = WireMock.put(urlMatcherForPath(url, requestNode));
                break;
            case "DELETE":
                builder = WireMock.delete(urlMatcherForPath(url, requestNode));
                break;
            case "PATCH":
                builder = WireMock.patch(urlMatcherForPath(url, requestNode));
                break;
            case "HEAD":
                builder = WireMock.head(urlMatcherForPath(url, requestNode));
                break;
            case "OPTIONS":
                builder = WireMock.options(urlMatcherForPath(url, requestNode));
                break;
            case "TRACE":
                builder = WireMock.trace(urlMatcherForPath(url, requestNode));
                break;
            default:
                builder = WireMock.any(urlMatcherForPath(url, requestNode));
        }
        
        // Add headers
        if (requestNode.has("headers") && requestNode.get("headers").isObject()) {
            JsonNode headers = requestNode.get("headers");
            Iterator<Map.Entry<String, JsonNode>> fields = headers.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                builder.withHeader(field.getKey(), WireMock.equalTo(field.getValue().asText()));
            }
        }
        
        // Add body matchers
        if (requestNode.has("body")) {
            JsonNode body = requestNode.get("body");
            if (body.isTextual()) {
                builder.withRequestBody(WireMock.equalTo(body.asText()));
            } else {
                builder.withRequestBody(WireMock.equalToJson(body.toString()));
            }
        }
        
        return builder;
    }

    private UrlPattern urlMatcherForPath(String path, JsonNode requestNode) {
        // Check for URL pattern type (exact, regex, pattern)
        if (requestNode.has("urlPattern")) {
            return WireMock.urlMatching(requestNode.get("urlPattern").asText());
        } else if (requestNode.has("urlPath")) {
            return WireMock.urlPathEqualTo(requestNode.get("urlPath").asText());
        } else if (requestNode.has("urlPathPattern")) {
            return WireMock.urlPathMatching(requestNode.get("urlPathPattern").asText());
        } else {
            return WireMock.urlEqualTo(path);
        }
    }

    private ResponseDefinitionBuilder createResponseBuilder(Stub stub) throws Exception {
        JsonNode responseNode = parseJsonNode(stub.getResponse());
        ResponseDefinitionBuilder builder = WireMock.aResponse();
        
        if (responseNode.has("status")) {
            builder.withStatus(responseNode.get("status").asInt());
        } else {
            builder.withStatus(200);
        }
        
        // Add headers
        if (responseNode.has("headers") && responseNode.get("headers").isObject()) {
            JsonNode headers = responseNode.get("headers");
            Iterator<Map.Entry<String, JsonNode>> fields = headers.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> field = fields.next();
                builder.withHeader(field.getKey(), field.getValue().asText());
            }
        }
        
        // Add body
        if (responseNode.has("body")) {
            JsonNode body = responseNode.get("body");
            if (body.isTextual()) {
                builder.withBody(body.asText());
            } else {
                builder.withBody(body.toString());
                
                // If no Content-Type is specified but we're returning JSON, add it
                if (!responseNode.has("headers") || 
                    !responseNode.get("headers").has("Content-Type")) {
                    builder.withHeader("Content-Type", "application/json");
                }
            }
        }
        
        // Add delay if specified
        if (responseNode.has("fixedDelayMilliseconds")) {
            builder.withFixedDelay(responseNode.get("fixedDelayMilliseconds").asInt());
        }
        
        return builder;
    }

    private void removeWireMockMapping(Stub stub) {
        try {
            // First try to remove by metadata id if available
            JsonNode metadataNode = parseJsonNode(stub.getMetadata());
            if (metadataNode != null && metadataNode.has("wireMockId")) {
                String wireMockId = metadataNode.get("wireMockId").asText();
                wireMockServer.removeStubMapping(UUID.fromString(wireMockId));
                return;
            }
            
            // Otherwise, try to match based on name or URL path
            for (StubMapping mapping : wireMockServer.getStubMappings()) {
                if (mapping.getName() != null && mapping.getName().equals(stub.getName())) {
                    wireMockServer.removeStubMapping(mapping);
                    return;
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to remove WireMock mapping", e);
        }
    }
    
    private JsonNode parseJsonNode(String json) {
        try {
            if (json == null || json.isEmpty()) {
                return objectMapper.createObjectNode();
            }
            return objectMapper.readTree(json);
        } catch (Exception e) {
            return objectMapper.createObjectNode();
        }
    }
}