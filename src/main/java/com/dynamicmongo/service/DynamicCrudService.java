package com.dynamicmongo.service;

import com.dynamicmongo.model.CollectionSchema;
import com.dynamicmongo.model.DynamicDocument;
import com.dynamicmongo.model.FieldDefinition;
import com.dynamicmongo.repository.CollectionSchemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DynamicCrudService {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Autowired
    private CollectionSchemaRepository schemaRepository;
    
    @Autowired
    private DataValidationService validationService;
    
    public CollectionSchema createSchema(CollectionSchema schema) {
        if (schemaRepository.existsByCollectionName(schema.getCollectionName())) {
            throw new IllegalArgumentException("Collection schema already exists: " + schema.getCollectionName());
        }
        return schemaRepository.save(schema);
    }
    
    public Optional<CollectionSchema> getSchema(String collectionName) {
        return schemaRepository.findByCollectionName(collectionName);
    }
    
    public CollectionSchema updateSchema(String collectionName, CollectionSchema updatedSchema) {
        Optional<CollectionSchema> existingSchema = schemaRepository.findByCollectionName(collectionName);
        if (existingSchema.isEmpty()) {
            throw new IllegalArgumentException("Collection schema not found: " + collectionName);
        }
        
        CollectionSchema schema = existingSchema.get();
        schema.setFields(updatedSchema.getFields());
        return schemaRepository.save(schema);
    }
    
    public void deleteSchema(String collectionName) {
        Optional<CollectionSchema> schema = schemaRepository.findByCollectionName(collectionName);
        if (schema.isPresent()) {
            schemaRepository.delete(schema.get());
            mongoTemplate.dropCollection(collectionName);
        }
    }
    
    public DynamicDocument createDocument(String collectionName, Map<String, Object> data) {
        Optional<CollectionSchema> schemaOpt = getSchema(collectionName);
        if (schemaOpt.isEmpty()) {
            throw new IllegalArgumentException("Collection schema not found: " + collectionName);
        }
        
        CollectionSchema schema = schemaOpt.get();
        List<String> validationErrors = validationService.validateDocument(data, schema);
        if (!validationErrors.isEmpty()) {
            throw new IllegalArgumentException("Validation errors: " + String.join(", ", validationErrors));
        }
        
        applyDefaultValues(data, schema.getFields());
        
        DynamicDocument document = new DynamicDocument(data, collectionName);
        return mongoTemplate.save(document, collectionName);
    }
    
    public Optional<DynamicDocument> getDocument(String collectionName, String id) {
        return Optional.ofNullable(mongoTemplate.findById(id, DynamicDocument.class, collectionName));
    }
    
    public List<DynamicDocument> getAllDocuments(String collectionName) {
        return mongoTemplate.findAll(DynamicDocument.class, collectionName);
    }
    
    public List<DynamicDocument> findDocuments(String collectionName, Map<String, Object> criteria) {
        Query query = new Query();
        
        for (Map.Entry<String, Object> entry : criteria.entrySet()) {
            query.addCriteria(Criteria.where("data." + entry.getKey()).is(entry.getValue()));
        }
        
        return mongoTemplate.find(query, DynamicDocument.class, collectionName);
    }
    
    public DynamicDocument updateDocument(String collectionName, String id, Map<String, Object> updates) {
        Optional<CollectionSchema> schemaOpt = getSchema(collectionName);
        if (schemaOpt.isEmpty()) {
            throw new IllegalArgumentException("Collection schema not found: " + collectionName);
        }
        
        Optional<DynamicDocument> existingDoc = getDocument(collectionName, id);
        if (existingDoc.isEmpty()) {
            throw new IllegalArgumentException("Document not found: " + id);
        }
        
        Map<String, Object> mergedData = existingDoc.get().getData();
        mergedData.putAll(updates);
        
        CollectionSchema schema = schemaOpt.get();
        List<String> validationErrors = validationService.validateDocument(mergedData, schema);
        if (!validationErrors.isEmpty()) {
            throw new IllegalArgumentException("Validation errors: " + String.join(", ", validationErrors));
        }
        
        Update update = new Update();
        update.set("data", mergedData);
        update.set("updatedAt", LocalDateTime.now());
        
        mongoTemplate.updateFirst(
            Query.query(Criteria.where("id").is(id)),
            update,
            DynamicDocument.class,
            collectionName
        );
        
        return getDocument(collectionName, id).orElse(null);
    }
    
    public boolean deleteDocument(String collectionName, String id) {
        Query query = Query.query(Criteria.where("id").is(id));
        return mongoTemplate.remove(query, DynamicDocument.class, collectionName).getDeletedCount() > 0;
    }
    
    public List<CollectionSchema> getAllSchemas() {
        return schemaRepository.findAll();
    }
    
    private void applyDefaultValues(Map<String, Object> data, List<FieldDefinition> fields) {
        for (FieldDefinition field : fields) {
            if (!data.containsKey(field.getName()) && field.getDefaultValue() != null) {
                data.put(field.getName(), field.getDefaultValue());
            }
        }
    }
}
