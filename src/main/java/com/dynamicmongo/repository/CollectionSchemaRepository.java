package com.dynamicmongo.repository;

import com.dynamicmongo.model.CollectionSchema;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CollectionSchemaRepository extends MongoRepository<CollectionSchema, String> {
    Optional<CollectionSchema> findByCollectionName(String collectionName);
    boolean existsByCollectionName(String collectionName);
    void deleteByCollectionName(String collectionName);
}
