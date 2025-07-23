package com.dynamicmongo.service;

import com.dynamicmongo.model.FieldDefinition;
import com.dynamicmongo.model.CollectionSchema;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class DataValidationService {
    
    public List<String> validateDocument(Map<String, Object> data, CollectionSchema schema) {
        List<String> errors = new ArrayList<>();
        
        for (FieldDefinition field : schema.getFields()) {
            validateField(data, field, errors, "");
        }
        
        return errors;
    }
    
    private void validateField(Map<String, Object> data, FieldDefinition field, 
                              List<String> errors, String prefix) {
        String fieldPath = prefix.isEmpty() ? field.getName() : prefix + "." + field.getName();
        Object value = data.get(field.getName());
        
        if (field.isRequired() && (value == null || value.toString().trim().isEmpty())) {
            errors.add("Field '" + fieldPath + "' is required");
            return;
        }
        
        if (value == null) return;
        
        switch (field.getType().toUpperCase()) {
            case "STRING":
                if (!(value instanceof String)) {
                    errors.add("Field '" + fieldPath + "' must be a string");
                }
                break;
            case "INTEGER":
                if (!(value instanceof Integer) && !(value instanceof Long)) {
                    try {
                        Integer.parseInt(value.toString());
                    } catch (NumberFormatException e) {
                        errors.add("Field '" + fieldPath + "' must be an integer");
                    }
                }
                break;
            case "DOUBLE":
                if (!(value instanceof Double) && !(value instanceof Float)) {
                    try {
                        Double.parseDouble(value.toString());
                    } catch (NumberFormatException e) {
                        errors.add("Field '" + fieldPath + "' must be a number");
                    }
                }
                break;
            case "BOOLEAN":
                if (!(value instanceof Boolean)) {
                    if (!value.toString().equalsIgnoreCase("true") && 
                        !value.toString().equalsIgnoreCase("false")) {
                        errors.add("Field '" + fieldPath + "' must be a boolean");
                    }
                }
                break;
        }
        
        validateCustomRules(value, field, fieldPath, errors);
    }
    
    private void validateCustomRules(Object value, FieldDefinition field, 
                                   String fieldPath, List<String> errors) {
        if (field.getValidation() == null) return;
        
        Map<String, Object> validation = field.getValidation();
        
        if (validation.containsKey("minLength") && value instanceof String) {
            int minLength = (Integer) validation.get("minLength");
            if (((String) value).length() < minLength) {
                errors.add("Field '" + fieldPath + "' must be at least " + minLength + " characters");
            }
        }
        
        if (validation.containsKey("maxLength") && value instanceof String) {
            int maxLength = (Integer) validation.get("maxLength");
            if (((String) value).length() > maxLength) {
                errors.add("Field '" + fieldPath + "' must be at most " + maxLength + " characters");
            }
        }
        
        if (validation.containsKey("min") && value instanceof Number) {
            double min = ((Number) validation.get("min")).doubleValue();
            if (((Number) value).doubleValue() < min) {
                errors.add("Field '" + fieldPath + "' must be at least " + min);
            }
        }
        
        if (validation.containsKey("max") && value instanceof Number) {
            double max = ((Number) validation.get("max")).doubleValue();
            if (((Number) value).doubleValue() > max) {
                errors.add("Field '" + fieldPath + "' must be at most " + max);
            }
        }
    }
}
