package com.wiremock.ui.controller;

import com.wiremock.ui.model.Stub;
import com.wiremock.ui.service.StubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stubs")
@RequiredArgsConstructor
public class StubController {
    private final StubService stubService;

    @PostMapping
    public ResponseEntity<Stub> createStub(@RequestBody Stub stub) {
        return ResponseEntity.ok(stubService.createStub(stub));
    }

    @GetMapping
    public ResponseEntity<List<Stub>> getAllStubs() {
        return ResponseEntity.ok(stubService.getAllStubs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Stub> getStubById(@PathVariable Long id) {
        return ResponseEntity.ok(stubService.getStubById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Stub> updateStub(@PathVariable Long id, @RequestBody Stub stub) {
        return ResponseEntity.ok(stubService.updateStub(id, stub));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStub(@PathVariable Long id) {
        stubService.deleteStub(id);
        return ResponseEntity.noContent().build();
    }
}