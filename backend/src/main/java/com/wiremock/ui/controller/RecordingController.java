package com.wiremock.ui.controller;

import com.wiremock.ui.service.RecordingService;
import com.wiremock.ui.model.RecordingStatus;
import com.wiremock.ui.model.RecordingStatusResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recording")
public class RecordingController {

    private final RecordingService recordingService;

    public RecordingController(RecordingService recordingService) {
        this.recordingService = recordingService;
    }

    @PostMapping("/start")
    public ResponseEntity<Void> startRecording(@RequestParam String targetUrl) {
        recordingService.startRecording(targetUrl);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/stop")
    public ResponseEntity<Void> stopRecording() {
        recordingService.stopRecording();
        return ResponseEntity.ok().build();
    }

    @GetMapping(value = "/status", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<RecordingStatusResponse> getRecordingStatus() {
        RecordingStatusResponse status = recordingService.getStatus();
        return ResponseEntity.ok(status);
    }

    @PostMapping("/playback/start")
    public ResponseEntity<Void> startPlayback() {
        recordingService.startPlayback();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/playback/stop")
    public ResponseEntity<Void> stopPlayback() {
        recordingService.stopPlayback();
        return ResponseEntity.ok().build();
    }
} 