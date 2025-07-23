package com.dynamicmongo.model;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import java.util.Map;

@Schema(description = "Definition of a field in a collection schema")
public class FieldDefinition {
    @Schema(description = "Name of the field", example = "name", required = true)
    private String name;
    
    @Schema(description = "Data type of the field", example = "STRING", 
            allowableValues = {"STRING", "INTEGER", "DOUBLE", "BOOLEAN", "DATE", "OBJECT", "ARRAY"},
            required = true)
    private String type;
    
    @Schema(description = "Whether the field is required", example = "true")
    private boolean required;
    
    @Schema(description = "Default value for the field", example = "default value")
    private Object defaultValue;
    
    @Schema(description = "Validation rules for the field", 
            example = "{\"minLength\": 2, \"maxLength\": 100}")
    private Map<String, Object> validation;
    
    @Schema(description = "Nested field definitions for OBJECT type fields")
    private List<FieldDefinition> nestedFields;
    
    public FieldDefinition() {}
    
    public FieldDefinition(String name, String type, boolean required) {
        this.name = name;
        this.type = type;
        this.required = required;
    }
    
    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public boolean isRequired() { return required; }
    public void setRequired(boolean required) { this.required = required; }
    
    public Object getDefaultValue() { return defaultValue; }
    public void setDefaultValue(Object defaultValue) { this.defaultValue = defaultValue; }
    
    public Map<String, Object> getValidation() { return validation; }
    public void setValidation(Map<String, Object> validation) { this.validation = validation; }
    
    public List<FieldDefinition> getNestedFields() { return nestedFields; }
    public void setNestedFields(List<FieldDefinition> nestedFields) { this.nestedFields = nestedFields; }
}
