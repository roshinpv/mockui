package com.wiremock.ui.model;

/**
 * Response object for recording status
 * This ensures proper serialization to JSON
 */
public class RecordingStatusResponse {
    
    private RecordingStatus status;
    private String targetUrl;
    
    public RecordingStatusResponse() {
        // Default constructor for serialization
    }
    
    public RecordingStatus getStatus() {
        return status;
    }
    
    public void setStatus(RecordingStatus status) {
        this.status = status;
    }
    
    public String getTargetUrl() {
        return targetUrl;
    }
    
    public void setTargetUrl(String targetUrl) {
        this.targetUrl = targetUrl;
    }
} 