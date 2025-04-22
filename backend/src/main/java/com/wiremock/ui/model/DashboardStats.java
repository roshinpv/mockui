package com.wiremock.ui.model;

import lombok.Data;

@Data
public class DashboardStats {
    private int totalStubs;
    private int activeStubs;
    private int stubsWithFaults;
    private int stubsWithScenarios;
    private int totalRequests;
    private int totalGraphQLStubs;
    private int totalSoapStubs;
    private int activeGraphQLStubs;
    private int activeSoapStubs;
    private int recentRequests;
    private int errorRequests;
    private int successRequests;
} 