package com.wiremock.ui.service;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.stubbing.StubMapping;
import com.wiremock.ui.model.Stub;
import com.wiremock.ui.repository.StubRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StubService {
    private final StubRepository stubRepository;
    private final WireMockServer wireMockServer;
    private final ObjectMapper objectMapper;

    @Transactional
    public Stub createStub(Stub stub) {
        Stub savedStub = stubRepository.save(stub);
        updateWireMockStub(savedStub);
        return savedStub;
    }

    @Transactional(readOnly = true)
    public List<Stub> getAllStubs() {
        return stubRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Stub getStubById(Long id) {
        return stubRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Stub not found"));
    }

    @Transactional
    public Stub updateStub(Long id, Stub stub) {
        Stub existingStub = getStubById(id);
        // Update fields
        existingStub.setName(stub.getName());
        existingStub.setRequest(stub.getRequest());
        existingStub.setResponse(stub.getResponse());
        existingStub.setPriority(stub.getPriority());
        existingStub.setScenarioName(stub.getScenarioName());
        existingStub.setRequiredScenarioState(stub.getRequiredScenarioState());
        existingStub.setNewScenarioState(stub.getNewScenarioState());
        existingStub.setPersistent(stub.isPersistent());
        existingStub.setEnabled(stub.isEnabled());
        existingStub.setMetadata(stub.getMetadata());

        Stub updatedStub = stubRepository.save(existingStub);
        updateWireMockStub(updatedStub);
        return updatedStub;
    }

    @Transactional
    public void deleteStub(Long id) {
        Stub stub = getStubById(id);
        stubRepository.delete(stub);
        removeWireMockStub(stub);
    }

    private void updateWireMockStub(Stub stub) {
        try {
            StubMapping stubMapping = objectMapper.readValue(stub.getRequest(), StubMapping.class);
            wireMockServer.addStubMapping(stubMapping);
        } catch (Exception e) {
            throw new RuntimeException("Failed to update WireMock stub", e);
        }
    }

    private void removeWireMockStub(Stub stub) {
        try {
            StubMapping stubMapping = objectMapper.readValue(stub.getRequest(), StubMapping.class);
            wireMockServer.removeStubMapping(stubMapping);
        } catch (Exception e) {
            throw new RuntimeException("Failed to remove WireMock stub", e);
        }
    }
}