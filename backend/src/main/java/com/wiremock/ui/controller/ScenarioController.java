package com.wiremock.ui.controller;

import com.wiremock.ui.service.ScenarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scenarios")
@RequiredArgsConstructor
public class ScenarioController {
    private final ScenarioService scenarioService;

    @GetMapping
    public ResponseEntity<List<Map<String, String>>> getAllScenarios() {
        return ResponseEntity.ok(scenarioService.getAllScenarios());
    }

    @PutMapping("/{scenarioName}/state")
    public ResponseEntity<Void> updateScenarioState(
            @PathVariable String scenarioName,
            @RequestParam String state) {
        scenarioService.updateScenarioState(scenarioName, state);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> resetScenarios() {
        scenarioService.resetScenarios();
        return ResponseEntity.ok().build();
    }
}