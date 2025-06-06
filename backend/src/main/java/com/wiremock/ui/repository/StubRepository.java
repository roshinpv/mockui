package com.wiremock.ui.repository;

import com.wiremock.ui.model.Stub;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StubRepository extends MongoRepository<Stub, String> {
    List<Stub> findByEnabled(boolean enabled);
    List<Stub> findByScenarioNameIsNotNull();
}