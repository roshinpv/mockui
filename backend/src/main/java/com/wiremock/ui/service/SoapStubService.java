package com.wiremock.ui.service;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.wiremock.ui.model.SoapStub;
import com.wiremock.ui.repository.SoapStubRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.w3c.dom.Document;
import org.xml.sax.SAXException;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.io.StringReader;
import java.net.URL;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SoapStubService {
    private final SoapStubRepository soapStubRepository;
    private final WireMockServer wireMockServer;
    private final ObjectMapper objectMapper;

    @Transactional
    public SoapStub createStub(SoapStub stub) {
        validateSoapMessage(stub.getRequest());
        validateSoapMessage(stub.getResponse());
        SoapStub savedStub = soapStubRepository.save(stub);
        updateWireMockStub(savedStub);
        return savedStub;
    }

    @Transactional(readOnly = true)
    public List<SoapStub> getAllStubs() {
        return soapStubRepository.findAll();
    }

    @Transactional(readOnly = true)
    public SoapStub getStubById(String id) {
        return soapStubRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("SOAP stub not found with ID: " + id));
    }

    @Transactional
    public SoapStub updateStub(String id, SoapStub stub) {
        validateSoapMessage(stub.getRequest());
        validateSoapMessage(stub.getResponse());
        
        SoapStub existingStub = getStubById(id);
        
        existingStub.setName(stub.getName());
        existingStub.setWsdlUrl(stub.getWsdlUrl());
        existingStub.setSoapAction(stub.getSoapAction());
        existingStub.setSoapVersion(stub.getSoapVersion());
        existingStub.setRequest(stub.getRequest());
        existingStub.setResponse(stub.getResponse());
        existingStub.setXmlNamespaces(stub.getXmlNamespaces());
        existingStub.setXpathMatchers(stub.getXpathMatchers());
        existingStub.setPriority(stub.getPriority());
        existingStub.setScenarioName(stub.getScenarioName());
        existingStub.setScenarioState(stub.getScenarioState());
        existingStub.setPersistent(stub.isPersistent());
        existingStub.setEnabled(stub.isEnabled());
        existingStub.setMetadata(stub.getMetadata());

        SoapStub updatedStub = soapStubRepository.save(existingStub);
        updateWireMockStub(updatedStub);
        return updatedStub;
    }

    @Transactional
    public void deleteStub(String id) {
        SoapStub stub = getStubById(id);
        soapStubRepository.delete(stub);
        removeWireMockStub(stub);
    }

    public void validateWsdl(String wsdlUrl) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new URL(wsdlUrl).openStream());
            
            // Basic WSDL validation
            if (!doc.getDocumentElement().getLocalName().equals("definitions")) {
                throw new RuntimeException("Invalid WSDL: missing definitions element");
            }
        } catch (Exception e) {
            throw new RuntimeException("Invalid WSDL: " + e.getMessage(), e);
        }
    }

    private void validateSoapMessage(String message) {
        if (message == null || message.trim().isEmpty()) {
            throw new RuntimeException("SOAP message cannot be empty");
        }

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setNamespaceAware(true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(new org.xml.sax.InputSource(new StringReader(message)));
            
            // Basic SOAP envelope validation
            if (!doc.getDocumentElement().getLocalName().equals("Envelope")) {
                throw new RuntimeException("Invalid SOAP message: missing Envelope element");
            }
        } catch (ParserConfigurationException | SAXException | IOException e) {
            throw new RuntimeException("Invalid SOAP message: " + e.getMessage(), e);
        }
    }

    private void updateWireMockStub(SoapStub stub) {
        try {
            String xpathMatchers = stub.getXpathMatchers();
            String responseXml = stub.getResponse();
            
            wireMockServer.stubFor(WireMock.post(WireMock.urlPathEqualTo("/soap"))
                .withHeader("Content-Type", WireMock.containing("text/xml"))
                .withHeader("SOAPAction", WireMock.equalTo(stub.getSoapAction()))
                .withRequestBody(WireMock.matchingXPath(xpathMatchers))
                .willReturn(WireMock.aResponse()
                    .withHeader("Content-Type", "text/xml")
                    .withBody(responseXml)));
        } catch (Exception e) {
            throw new RuntimeException("Failed to update WireMock SOAP stub", e);
        }
    }

    private void removeWireMockStub(SoapStub stub) {
        wireMockServer.removeStubMapping(WireMock.post("/soap")
            .withHeader("SOAPAction", WireMock.equalTo(stub.getSoapAction()))
            .build());
    }
}