package com.wiremock.ui.dto;

import lombok.Data;

/**
 * Data Transfer Object for Stub creation/update requests.
 * This helps handle JSON deserialization correctly.
 */
@Data
public class StubRequest {
    private String name;
    private Object request;
    private Object response;
    private Integer priority;
    private String scenarioName;
    private String requiredScenarioState;
    private String newScenarioState;
    private Boolean persistent;
    private Boolean enabled = true;
    private Object metadata;
} 