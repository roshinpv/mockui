package com.wiremock.ui.controller;

import com.wiremock.ui.model.GraphQLStub;
import com.wiremock.ui.service.GraphQLStubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/graphql-stubs")
@RequiredArgsConstructor
public class GraphQLStubController {
    private final GraphQLStubService graphQLStubService;

    @PostMapping
    public ResponseEntity<GraphQLStub> createStub(@RequestBody GraphQLStub stub) {
        return ResponseEntity.ok(graphQLStubService.createStub(stub));
    }

    @GetMapping
    public ResponseEntity<List<GraphQLStub>> getAllStubs() {
        return ResponseEntity.ok(graphQLStubService.getAllStubs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GraphQLStub> getStubById(@PathVariable String id) {
        return ResponseEntity.ok(graphQLStubService.getStubById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GraphQLStub> updateStub(@PathVariable String id, @RequestBody GraphQLStub stub) {
        return ResponseEntity.ok(graphQLStubService.updateStub(id, stub));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStub(@PathVariable String id) {
        graphQLStubService.deleteStub(id);
        return ResponseEntity.noContent().build();
    }
}