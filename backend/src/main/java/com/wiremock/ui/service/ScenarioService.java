package com.wiremock.ui.service;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.stubbing.Scenario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScenarioService {
    private final WireMockServer wireMockServer;

    public List<Map<String, String>> getAllScenarios() {
        return wireMockServer.getAllScenarios().getScenarios().stream()
            .map(scenario -> Map.of(
                "name", scenario.getName(),
                "state", scenario.getState()
            ))
            .collect(Collectors.toList());
    }

    public void updateScenarioState(String scenarioName, String state) {
        wireMockServer.setScenarioState(scenarioName, state);
    }

    public void resetScenarios() {
        wireMockServer.resetScenarios();
    }
} 