package com.wiremock.ui.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoTransactionException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import com.mongodb.MongoTimeoutException;
import com.mongodb.MongoException;
import com.wiremock.ui.model.Stub;
import com.wiremock.ui.repository.StubRepository;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initializeData(MongoTemplate mongoTemplate, StubRepository stubRepository) {
        return args -> {
            try {
                log.info("Initializing database...");
                
                // Check MongoDB connection first
                try {
                    mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
                    log.info("MongoDB connection successful");
                } catch (MongoTimeoutException e) {
                    log.error("MongoDB connection timeout. Is MongoDB running?", e);
                    return;
                } catch (MongoException e) {
                    log.error("MongoDB error: {}", e.getMessage(), e);
                    return;
                }
                
                // Check if the collection exists and create it if it doesn't
                if (!mongoTemplate.collectionExists(Stub.class)) {
                    log.info("Creating 'stubs' collection in MongoDB");
                    mongoTemplate.createCollection(Stub.class);
                }
                
                // Check if we have any data
                long count = stubRepository.count();
                log.info("Found {} stubs in the database", count);
                
                // Optionally add a sample stub if the database is empty
                if (count == 0) {
                    log.info("Adding a sample stub to the database");
                    Stub stub = new Stub();
                    stub.setName("Sample Stub");
                    stub.setRequest("{}");
                    stub.setResponse("{}");
                    stub.setEnabled(true);
                    stub.setPersistent(true);
                    stub.setMetadata("{}");
                    
                    stubRepository.save(stub);
                    log.info("Sample stub created successfully with ID: {}", stub.getId());
                }
            } catch (Exception e) {
                log.error("Error initializing database: {}", e.getMessage(), e);
            }
        };
    }
} 