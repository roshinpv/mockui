package com.wiremock.ui.repository;

import com.wiremock.ui.model.Stub;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StubRepository extends JpaRepository<Stub, Long> {
    List<Stub> findByEnabled(boolean enabled);
    List<Stub> findByScenarioNameIsNotNull();
}