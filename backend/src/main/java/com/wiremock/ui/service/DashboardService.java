package com.wiremock.ui.service;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.verification.LoggedRequest;
import com.wiremock.ui.model.DashboardStats;
import com.wiremock.ui.repository.GraphQLStubRepository;
import com.wiremock.ui.repository.SoapStubRepository;
import com.wiremock.ui.repository.StubRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final StubRepository stubRepository;
    private final GraphQLStubRepository graphQLStubRepository;
    private final SoapStubRepository soapStubRepository;
    private final WireMockServer wireMockServer;

    public DashboardStats getDashboardStats() {
        DashboardStats stats = new DashboardStats();

        // Calculate stub statistics
        stats.setTotalStubs((int) stubRepository.count());
        stats.setActiveStubs(stubRepository.findByEnabled(true).size());
        stats.setStubsWithScenarios(stubRepository.findByScenarioNameIsNotNull().size());
        
        // Calculate GraphQL stub statistics
        stats.setTotalGraphQLStubs((int) graphQLStubRepository.count());
        stats.setActiveGraphQLStubs(graphQLStubRepository.findByEnabled(true).size());
        
        // Calculate SOAP stub statistics
        stats.setTotalSoapStubs((int) soapStubRepository.count());
        stats.setActiveSoapStubs(soapStubRepository.findByEnabled(true).size());

        // Calculate request statistics
        var serveEvents = wireMockServer.getAllServeEvents();
        List<LoggedRequest> allRequests = serveEvents.stream()
            .map(event -> event.getRequest())
            .toList();
        
        stats.setTotalRequests(allRequests.size());
        
        // Calculate recent requests (last 24 hours)
        Instant twentyFourHoursAgo = Instant.now().minus(24, ChronoUnit.HOURS);
        List<LoggedRequest> recentRequests = allRequests.stream()
            .filter(request -> request.getLoggedDate().toInstant().isAfter(twentyFourHoursAgo))
            .toList();
        
        stats.setRecentRequests(recentRequests.size());
        
        // Calculate success and error requests
        long successCount = serveEvents.stream()
            .filter(event -> {
                int status = event.getResponse().getStatus();
                return status >= 200 && status < 300;
            })
            .count();
        long errorCount = serveEvents.stream()
            .filter(event -> {
                int status = event.getResponse().getStatus();
                return status >= 400;
            })
            .count();
        
        stats.setSuccessRequests((int) successCount);
        stats.setErrorRequests((int) errorCount);

        return stats;
    }
} 