package com.wiremock.ui.repository;

import com.wiremock.ui.model.GraphQLStub;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GraphQLStubRepository extends MongoRepository<GraphQLStub, String> {
    List<GraphQLStub> findByEnabled(boolean enabled);
}