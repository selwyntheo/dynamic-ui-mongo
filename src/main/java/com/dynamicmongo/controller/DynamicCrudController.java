package com.dynamicmongo.controller;

import com.dynamicmongo.model.CollectionSchema;
import com.dynamicmongo.model.DynamicDocument;
import com.dynamicmongo.service.DynamicCrudService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/dynamic")
@CrossOrigin(origins = "*")
@Tag(name = "Dynamic MongoDB CRUD", description = "APIs for managing dynamic MongoDB collections and documents")
public class DynamicCrudController {
    
    @Autowired
    private DynamicCrudService crudService;
    
    @Operation(
        summary = "Create a new collection schema",
        description = "Creates a new MongoDB collection with a dynamic schema definition"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Schema created successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = CollectionSchema.class))),
        @ApiResponse(responseCode = "400", description = "Invalid schema data or collection already exists",
            content = @Content(mediaType = "application/json", 
                examples = @ExampleObject(value = "{\"error\": \"Collection schema already exists: products\"}")))
    })
    @PostMapping("/schemas")
    public ResponseEntity<?> createSchema(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Collection schema definition",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                      "collectionName": "products",
                      "fields": [
                        {
                          "name": "name",
                          "type": "STRING",
                          "required": true,
                          "validation": {"minLength": 2, "maxLength": 100}
                        },
                        {
                          "name": "price",
                          "type": "DOUBLE",
                          "required": true,
                          "validation": {"min": 0}
                        }
                      ]
                    }
                    """
                )
            )
        )
        @RequestBody CollectionSchema schema) {
        try {
            CollectionSchema created = crudService.createSchema(schema);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @Operation(
        summary = "Get all collection schemas",
        description = "Retrieves a list of all defined collection schemas"
    )
    @ApiResponse(responseCode = "200", description = "List of schemas retrieved successfully")
    @GetMapping("/schemas")
    public ResponseEntity<List<CollectionSchema>> getAllSchemas() {
        return ResponseEntity.ok(crudService.getAllSchemas());
    }
    
    @Operation(
        summary = "Get a specific collection schema",
        description = "Retrieves the schema definition for a specific collection"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Schema found",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = CollectionSchema.class))),
        @ApiResponse(responseCode = "404", description = "Schema not found")
    })
    @GetMapping("/schemas/{collectionName}")
    public ResponseEntity<?> getSchema(
        @Parameter(description = "Name of the collection", example = "products")
        @PathVariable String collectionName) {
        Optional<CollectionSchema> schema = crudService.getSchema(collectionName);
        if (schema.isPresent()) {
            return ResponseEntity.ok(schema.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    @Operation(
        summary = "Update a collection schema",
        description = "Updates an existing collection schema"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Schema updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid schema data")
    })
    @PutMapping("/schemas/{collectionName}")
    public ResponseEntity<?> updateSchema(
        @Parameter(description = "Name of the collection", example = "products")
        @PathVariable String collectionName, 
        @RequestBody CollectionSchema schema) {
        try {
            CollectionSchema updated = crudService.updateSchema(collectionName, schema);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @Operation(
        summary = "Delete a collection schema",
        description = "Deletes a collection schema and all its documents"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Schema deleted successfully"),
        @ApiResponse(responseCode = "400", description = "Error deleting schema")
    })
    @DeleteMapping("/schemas/{collectionName}")
    public ResponseEntity<?> deleteSchema(
        @Parameter(description = "Name of the collection", example = "products")
        @PathVariable String collectionName) {
        try {
            crudService.deleteSchema(collectionName);
            return ResponseEntity.ok(Map.of("message", "Schema deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @Operation(
        summary = "Check if a collection exists",
        description = "Checks if a collection schema exists in the database"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Collection existence check completed",
            content = @Content(mediaType = "application/json",
                examples = @ExampleObject(value = "{\"exists\": true, \"collectionName\": \"products\"}")))
    })
    @GetMapping("/schemas/{collectionName}/exists")
    public ResponseEntity<Map<String, Object>> checkCollectionExists(
        @Parameter(description = "Name of the collection", example = "products")
        @PathVariable String collectionName) {
        boolean exists = crudService.getSchema(collectionName).isPresent();
        return ResponseEntity.ok(Map.of(
            "exists", exists,
            "collectionName", collectionName
        ));
    }
    
    @Operation(
        summary = "Create a new document",
        description = "Creates a new document in the specified collection"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Document created successfully",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = DynamicDocument.class))),
        @ApiResponse(responseCode = "400", description = "Invalid document data or validation error")
    })
    @PostMapping("/collections/{collectionName}/documents")
    public ResponseEntity<?> createDocument(
        @Parameter(description = "Name of the collection", example = "products")
        @PathVariable String collectionName,
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Document data",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                      "name": "Laptop",
                      "price": 999.99,
                      "category": "electronics",
                      "description": "High-performance laptop"
                    }
                    """
                )
            )
        )
        @RequestBody Map<String, Object> data) {
        try {
            DynamicDocument document = crudService.createDocument(collectionName, data);
            return ResponseEntity.status(HttpStatus.CREATED).body(document);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @Operation(
        summary = "Get all documents",
        description = "Retrieves all documents from a collection, optionally filtered"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Documents retrieved successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid filter criteria")
    })
    @GetMapping("/collections/{collectionName}/documents")
    public ResponseEntity<?> getAllDocuments(
        @Parameter(description = "Name of the collection", example = "products")
        @PathVariable String collectionName,
        @Parameter(description = "Filter criteria (optional)", example = "name=Laptop")
        @RequestParam(required = false) Map<String, Object> filter) {
        try {
            List<DynamicDocument> documents;
            if (filter != null && !filter.isEmpty()) {
                documents = crudService.findDocuments(collectionName, filter);
            } else {
                documents = crudService.getAllDocuments(collectionName);
            }
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @Operation(
        summary = "Get a specific document",
        description = "Retrieves a document by its ID from the specified collection"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Document found",
            content = @Content(mediaType = "application/json", schema = @Schema(implementation = DynamicDocument.class))),
        @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @GetMapping("/collections/{collectionName}/documents/{id}")
    public ResponseEntity<?> getDocument(
        @Parameter(description = "Name of the collection", example = "products")
        @PathVariable String collectionName,
        @Parameter(description = "Document ID", example = "507f1f77bcf86cd799439011")
        @PathVariable String id) {
        Optional<DynamicDocument> document = crudService.getDocument(collectionName, id);
        if (document.isPresent()) {
            return ResponseEntity.ok(document.get());
        }
        return ResponseEntity.notFound().build();
    }
    
    @Operation(
        summary = "Update a document",
        description = "Updates an existing document with new data"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Document updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid update data or validation error"),
        @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @PutMapping("/collections/{collectionName}/documents/{id}")
    public ResponseEntity<?> updateDocument(
        @Parameter(description = "Name of the collection", example = "products")
        @PathVariable String collectionName,
        @Parameter(description = "Document ID", example = "507f1f77bcf86cd799439011")
        @PathVariable String id,
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Updated document data",
            content = @Content(
                mediaType = "application/json",
                examples = @ExampleObject(
                    value = """
                    {
                      "price": 899.99,
                      "description": "Updated description"
                    }
                    """
                )
            )
        )
        @RequestBody Map<String, Object> updates) {
        try {
            DynamicDocument updated = crudService.updateDocument(collectionName, id, updates);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @Operation(
        summary = "Delete a document",
        description = "Deletes a document by its ID from the specified collection"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Document deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @DeleteMapping("/collections/{collectionName}/documents/{id}")
    public ResponseEntity<?> deleteDocument(
        @Parameter(description = "Name of the collection", example = "products")
        @PathVariable String collectionName,
        @Parameter(description = "Document ID", example = "507f1f77bcf86cd799439011")
        @PathVariable String id) {
        boolean deleted = crudService.deleteDocument(collectionName, id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Document deleted successfully"));
        }
        return ResponseEntity.notFound().build();
    }
}
