package com.wiremock.ui.config;

import com.github.tomakehurst.wiremock.WireMockServer;
import com.github.tomakehurst.wiremock.core.WireMockConfiguration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WireMockConfig {
    @Value("${wiremock.server.port}")
    private int port;

    @Value("${wiremock.server.root-dir}")
    private String rootDir;

    @Value("${wiremock.server.enable-browser-proxying}")
    private boolean enableBrowserProxying;

    @Value("${wiremock.server.disable-request-journal}")
    private boolean disableRequestJournal;

    @Value("${wiremock.server.max-request-journal-entries}")
    private int maxRequestJournalEntries;

    @Bean(destroyMethod = "stop")
    public WireMockServer wireMockServer() {
        WireMockConfiguration config = WireMockConfiguration.options()
            .port(port)
            .usingFilesUnderDirectory(rootDir);

        if (enableBrowserProxying) {
            config.enableBrowserProxying(true);
        }

        if (disableRequestJournal) {
            config.disableRequestJournal();
        } else {
            config.maxRequestJournalEntries(maxRequestJournalEntries);
        }

        WireMockServer server = new WireMockServer(config);
        server.start();
        return server;
    }
}