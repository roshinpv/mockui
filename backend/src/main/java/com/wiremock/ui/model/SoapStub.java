package com.wiremock.ui.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "soap_stubs")
public class SoapStub {
    @Id
    private String id;

    private String name;

    private String wsdlUrl;

    private String soapAction;

    private String soapVersion;

    private String request;

    private String response;

    private String xmlNamespaces;

    private String xpathMatchers;

    private Integer priority;

    private String scenarioName;

    private String scenarioState;

    private boolean persistent;

    private boolean enabled = true;

    private String metadata;
}