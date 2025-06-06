package com.wiremock.ui.repository;

import com.wiremock.ui.model.SoapStub;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SoapStubRepository extends MongoRepository<SoapStub, String> {
    List<SoapStub> findByEnabled(boolean enabled);
}