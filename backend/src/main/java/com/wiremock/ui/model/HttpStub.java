package com.wiremock.ui.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "http_stubs")
public class HttpStub {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String request;

    @Column(columnDefinition = "TEXT")
    private String response;

    private boolean persistent;

    private boolean enabled = true;

    @Column(columnDefinition = "TEXT")
    private String metadata;
} 