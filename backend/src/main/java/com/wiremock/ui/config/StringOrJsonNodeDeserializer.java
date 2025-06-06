package com.wiremock.ui.config;

import java.io.IOException;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.TextNode;

public class StringOrJsonNodeDeserializer extends JsonDeserializer<JsonNode> {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public JsonNode deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        try {
            JsonNode node = p.readValueAsTree();
            return node;
        } catch (Exception e) {
            // If the value is a String, return it as a TextNode
            String value = p.getValueAsString();
            if (value != null) {
                return TextNode.valueOf(value);
            }
            return null;
        }
    }
} 