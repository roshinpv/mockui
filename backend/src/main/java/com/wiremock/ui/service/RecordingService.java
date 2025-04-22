package com.wiremock.ui.service;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.recording.RecordSpec;
import com.github.tomakehurst.wiremock.recording.RecordSpecBuilder;
import com.github.tomakehurst.wiremock.recording.SnapshotRecordResult;
import com.wiremock.ui.model.RecordingStatus;
import com.wiremock.ui.model.RecordingStatusResponse;
import org.springframework.stereotype.Service;
import java.io.File;

@Service
public class RecordingService {

    private final WireMockServer wireMockServer;
    private RecordingStatus currentStatus = RecordingStatus.NeverStarted;
    private String targetUrl;

    public RecordingService(WireMockServer wireMockServer) {
        this.wireMockServer = wireMockServer;
    }

    public void startRecording(String targetUrl) {
        this.targetUrl = targetUrl;
        RecordSpec recordSpec = new RecordSpecBuilder()
            .forTarget(targetUrl)
            .extractTextBodiesOver(9999999)
            .extractBinaryBodiesOver(9999999)
            .build();

        wireMockServer.startRecording(recordSpec);
        currentStatus = RecordingStatus.Recording;
    }

    public void stopRecording() {
        SnapshotRecordResult recordResult = wireMockServer.stopRecording();
        currentStatus = RecordingStatus.Stopped;
        // You can process recordResult here if needed
    }

    public RecordingStatusResponse getStatus() {
        RecordingStatusResponse response = new RecordingStatusResponse();
        response.setStatus(currentStatus);
        response.setTargetUrl(targetUrl);
        return response;
    }

    public void startPlayback() {
        if (currentStatus == RecordingStatus.Stopped) {
            // Enable all recorded stubs
            wireMockServer.resetAll();
            currentStatus = RecordingStatus.Playing;
        }
    }

    public void stopPlayback() {
        if (currentStatus == RecordingStatus.Playing) {
            // Reset to default state
            wireMockServer.resetAll();
            currentStatus = RecordingStatus.Stopped;
        }
    }

    public String getTargetUrl() {
        return targetUrl;
    }
} 