package com.wiremock.ui.repository;

import com.wiremock.ui.model.GraphQLStub;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GraphQLStubRepository extends JpaRepository<GraphQLStub, Long> {
    List<GraphQLStub> findByEnabled(boolean enabled);
    List<GraphQLStub> findByOperationName(String operationName);
}