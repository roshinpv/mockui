package com.wiremock.ui.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@EnableMongoRepositories(basePackages = "com.wiremock.ui.repository")
public class MongoConfiguration {

    @Value("${spring.data.mongodb.host:localhost}")
    private String host;
    
    @Value("${spring.data.mongodb.port:27017}")
    private int port;
    
    @Value("${spring.data.mongodb.database:wiremockui}")
    private String database;

    @Bean
    public MongoClient mongoClient() {
        String connectionString = "mongodb://" + host + ":" + port;
        log.info("Connecting to MongoDB at: {}", connectionString);
        return MongoClients.create(connectionString);
    }
    
    @Bean
    public MongoTemplate mongoTemplate() {
        return new MongoTemplate(mongoClient(), database);
    }

    @Bean
    public LocalValidatorFactoryBean validator() {
        return new LocalValidatorFactoryBean();
    }
} 