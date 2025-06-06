package com.wiremock.ui.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.databind.JsonNode;

@Data
@Document(collection = "graphql_stubs")
public class GraphQLStub {
    @Id
    private String id;

    private String name;

    private String operation;

    private String operationType;
    
    private String operationName;
    
    private String query;

    private String variables;

    private String response;
    
    private Integer priority;
    
    private String scenarioName;
    
    private String requiredScenarioState;
    
    private String newScenarioState;

    private boolean persistent;

    private boolean enabled = true;

    private String metadata;
}