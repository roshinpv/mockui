package com.wiremock.ui.service;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.wiremock.ui.model.GraphQLStub;
import com.wiremock.ui.repository.GraphQLStubRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GraphQLStubService {
    private final GraphQLStubRepository graphQLStubRepository;
    private final WireMockServer wireMockServer;
    private final ObjectMapper objectMapper;

    @Transactional
    public GraphQLStub createStub(GraphQLStub stub) {
        GraphQLStub savedStub = graphQLStubRepository.save(stub);
        updateWireMockStub(savedStub);
        return savedStub;
    }

    @Transactional(readOnly = true)
    public List<GraphQLStub> getAllStubs() {
        return graphQLStubRepository.findAll();
    }

    @Transactional(readOnly = true)
    public GraphQLStub getStubById(String id) {
        return graphQLStubRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("GraphQL stub not found with ID: " + id));
    }

    @Transactional
    public GraphQLStub updateStub(String id, GraphQLStub stub) {
        GraphQLStub existingStub = getStubById(id);
        
        existingStub.setName(stub.getName());
        existingStub.setOperationName(stub.getOperationName());
        existingStub.setQuery(stub.getQuery());
        existingStub.setVariables(stub.getVariables());
        existingStub.setResponse(stub.getResponse());
        existingStub.setPriority(stub.getPriority());
        existingStub.setScenarioName(stub.getScenarioName());
        existingStub.setRequiredScenarioState(stub.getRequiredScenarioState());
        existingStub.setNewScenarioState(stub.getNewScenarioState());
        existingStub.setPersistent(stub.isPersistent());
        existingStub.setEnabled(stub.isEnabled());
        existingStub.setMetadata(stub.getMetadata());

        GraphQLStub updatedStub = graphQLStubRepository.save(existingStub);
        updateWireMockStub(updatedStub);
        return updatedStub;
    }

    @Transactional
    public void deleteStub(String id) {
        GraphQLStub stub = getStubById(id);
        graphQLStubRepository.delete(stub);
        removeWireMockStub(stub);
    }

    private void updateWireMockStub(GraphQLStub stub) {
        try {
            String responseJson = stub.getResponse();
            
            wireMockServer.stubFor(WireMock.post("/graphql")
                .withRequestBody(WireMock.matchingJsonPath("$.operationName", 
                    WireMock.equalTo(stub.getOperationName())))
                .withRequestBody(WireMock.matchingJsonPath("$.query", 
                    WireMock.equalTo(stub.getQuery())))
                .willReturn(WireMock.aResponse()
                    .withHeader("Content-Type", "application/json")
                    .withBody(responseJson)));
        } catch (Exception e) {
            throw new RuntimeException("Failed to update WireMock GraphQL stub", e);
        }
    }

    private void removeWireMockStub(GraphQLStub stub) {
        wireMockServer.removeStubMapping(WireMock.post("/graphql")
            .withRequestBody(WireMock.matchingJsonPath("$.operationName", 
                WireMock.equalTo(stub.getOperationName())))
            .build());
    }
}