package com.wiremock.ui.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.databind.JsonNode;

@Data
@Document(collection = "stubs")
public class Stub {
    @Id
    private String id;

    private String name;

    private String request;

    private String response;

    private Integer priority;

    private String scenarioName;

    private String requiredScenarioState;

    private String newScenarioState;

    private boolean persistent;

    private boolean enabled = true;

    private String metadata;
}
