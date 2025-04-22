package com.wiremock.ui.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "soap_stubs")
public class SoapStub {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "wsdl_url")
    private String wsdlUrl;

    @Column(name = "soap_action")
    private String soapAction;

    @Column(name = "soap_version", nullable = false)
    private String soapVersion;

    @Column(columnDefinition = "TEXT")
    private String request;

    @Column(columnDefinition = "TEXT")
    private String response;

    @Column(name = "xml_namespaces", columnDefinition = "TEXT")
    private String xmlNamespaces;

    @Column(name = "xpath_matchers", columnDefinition = "TEXT")
    private String xpathMatchers;

    private Integer priority;

    @Column(name = "scenario_name")
    private String scenarioName;

    @Column(name = "scenario_state")
    private String scenarioState;

    private boolean persistent;

    private boolean enabled = true;

    @Column(columnDefinition = "TEXT")
    private String metadata;
}