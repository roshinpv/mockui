package com.wiremock.ui.repository;

import com.wiremock.ui.model.SoapStub;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SoapStubRepository extends JpaRepository<SoapStub, Long> {
    List<SoapStub> findByEnabled(boolean enabled);
    List<SoapStub> findBySoapAction(String soapAction);
}