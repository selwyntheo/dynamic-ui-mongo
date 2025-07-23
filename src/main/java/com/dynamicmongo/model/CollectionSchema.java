package com.dynamicmongo.model;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "collection_schemas")
@Schema(description = "Schema definition for a dynamic MongoDB collection")
public class CollectionSchema {
    @Id
    @Schema(description = "Unique identifier for the schema", example = "507f1f77bcf86cd799439011")
    private String id;
    
    @Schema(description = "Name of the MongoDB collection", example = "products", required = true)
    private String collectionName;
    
    @Schema(description = "List of field definitions for the collection", required = true)
    private List<FieldDefinition> fields;
    
    @CreatedDate
    @Schema(description = "Timestamp when the schema was created", example = "2025-07-22T23:21:01.932")
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Schema(description = "Timestamp when the schema was last updated", example = "2025-07-22T23:21:01.932")
    private LocalDateTime updatedAt;
    
    @Schema(description = "User who created the schema", example = "admin")
    private String createdBy;
    
    public CollectionSchema() {}
    
    public CollectionSchema(String collectionName, List<FieldDefinition> fields) {
        this.collectionName = collectionName;
        this.fields = fields;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getCollectionName() { return collectionName; }
    public void setCollectionName(String collectionName) { this.collectionName = collectionName; }
    
    public List<FieldDefinition> getFields() { return fields; }
    public void setFields(List<FieldDefinition> fields) { this.fields = fields; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
