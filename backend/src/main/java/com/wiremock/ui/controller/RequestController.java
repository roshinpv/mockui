package com.wiremock.ui.controller;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.verification.LoggedRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {
    private final WireMockServer wireMockServer;

    @GetMapping
    public ResponseEntity<List<LoggedRequest>> getRequests() {
        return ResponseEntity.ok(wireMockServer.getAllServeEvents()
            .stream()
            .map(event -> event.getRequest())
            .toList());
    }

    @DeleteMapping
    public ResponseEntity<Void> clearRequests() {
        wireMockServer.resetRequests();
        return ResponseEntity.ok().build();
    }
}