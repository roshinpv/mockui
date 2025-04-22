package com.wiremock.ui.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;

@Data
@Entity
@Table(name = "stubs")
public class Stub {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String request;

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