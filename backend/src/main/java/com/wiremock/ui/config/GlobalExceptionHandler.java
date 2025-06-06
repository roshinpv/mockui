package com.wiremock.ui.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.fasterxml.jackson.databind.exc.MismatchedInputException;

import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        log.error("Message not readable exception: ", ex);
        Map<String, Object> errorResponse = new HashMap<>();
        
        Throwable cause = ex.getCause();
        if (cause instanceof JsonParseException) {
            errorResponse.put("error", "Invalid JSON format");
            errorResponse.put("message", "The request contains malformed JSON");
        } else if (cause instanceof InvalidFormatException) {
            InvalidFormatException ife = (InvalidFormatException) cause;
            errorResponse.put("error", "Data format error");
            errorResponse.put("message", "Cannot deserialize value: " + ife.getMessage());
        } else if (cause instanceof MismatchedInputException) {
            MismatchedInputException mie = (MismatchedInputException) cause;
            errorResponse.put("error", "Type mismatch error");
            errorResponse.put("message", "Cannot deserialize value: " + mie.getMessage());
            errorResponse.put("path", mie.getPath());
        } else if (cause instanceof JsonMappingException) {
            JsonMappingException jme = (JsonMappingException) cause;
            errorResponse.put("error", "JSON mapping error");
            errorResponse.put("message", jme.getMessage());
        } else {
            errorResponse.put("error", "Request parsing error");
            errorResponse.put("message", ex.getMessage());
        }
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        log.error("Unhandled exception: ", ex);
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Internal Server Error");
        errorResponse.put("message", ex.getMessage());
        
        // Include the stack trace in development environments
        StackTraceElement[] stackTrace = ex.getStackTrace();
        if (stackTrace.length > 0) {
            String stackTraceStr = stackTrace[0].toString();
            if (stackTrace.length > 1) {
                stackTraceStr += " | " + stackTrace[1].toString();
            }
            errorResponse.put("trace", stackTraceStr);
        }
        
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
} 