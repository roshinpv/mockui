package com.wiremock.ui.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "graphql_stubs")
public class GraphQLStub {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String operationName;

    @Column(columnDefinition = "TEXT")
    private String query;

    @Column(columnDefinition = "TEXT")
    private String variables;

    @Column(columnDefinition = "TEXT")
    private String response;

    private Integer priority;

    @Column(name = "scenario_name")
    private String scenarioName;

    @Column(name = "required_scenario_state")
    private String requiredScenarioState;

    @Column(name = "new_scenario_state")
    private String newScenarioState;

    private boolean persistent;

    private boolean enabled = true;

    @Column(columnDefinition = "TEXT")
    private String metadata;
}