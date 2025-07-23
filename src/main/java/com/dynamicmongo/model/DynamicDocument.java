package com.dynamicmongo.model;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import java.time.LocalDateTime;
import java.util.Map;

@Schema(description = "Dynamic document stored in a MongoDB collection")
public class DynamicDocument {
    @Id
    @Schema(description = "Unique identifier for the document", example = "507f1f77bcf86cd799439011")
    private String id;
    
    @Schema(description = "Document data as key-value pairs", 
            example = "{\"name\": \"Laptop\", \"price\": 999.99, \"category\": \"electronics\"}")
    private Map<String, Object> data;
    
    @Schema(description = "Name of the collection this document belongs to", example = "products")
    private String collectionName;
    
    @CreatedDate
    @Schema(description = "Timestamp when the document was created", example = "2025-07-22T23:21:29.815")
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Schema(description = "Timestamp when the document was last updated", example = "2025-07-22T23:21:29.815")
    private LocalDateTime updatedAt;
    
    public DynamicDocument() {}
    
    public DynamicDocument(Map<String, Object> data, String collectionName) {
        this.data = data;
        this.collectionName = collectionName;
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }
    
    public String getCollectionName() { return collectionName; }
    public void setCollectionName(String collectionName) { this.collectionName = collectionName; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
