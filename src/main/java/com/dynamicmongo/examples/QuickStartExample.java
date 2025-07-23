package com.dynamicmongo.examples;

import com.dynamicmongo.model.CollectionSchema;
import com.dynamicmongo.model.FieldDefinition;
import com.dynamicmongo.service.DynamicCrudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.Map;

@Component
public class QuickStartExample implements CommandLineRunner {
    
    @Autowired
    private DynamicCrudService crudService;
    
    @Override
    public void run(String... args) throws Exception {
        if (args.length > 0 && "demo".equals(args[0])) {
            createDemoData();
        }
    }
    
    private void createDemoData() {
        try {
            FieldDefinition nameField = new FieldDefinition("name", "STRING", true);
            nameField.setValidation(Map.of("minLength", 2, "maxLength", 100));
            
            FieldDefinition priceField = new FieldDefinition("price", "DOUBLE", true);
            priceField.setValidation(Map.of("min", 0));
            
            FieldDefinition categoryField = new FieldDefinition("category", "STRING", false);
            categoryField.setDefaultValue("general");
            
            CollectionSchema schema = new CollectionSchema("products", 
                Arrays.asList(nameField, priceField, categoryField));
            
            crudService.createSchema(schema);
            System.out.println("✅ Demo schema 'products' created successfully!");
            
            crudService.createDocument("products", Map.of(
                "name", "Sample Product 1",
                "price", 99.99,
                "category", "electronics"
            ));
            
            crudService.createDocument("products", Map.of(
                "name", "Sample Product 2", 
                "price", 149.50,
                "category", "books"
            ));
            
            System.out.println("✅ Demo documents created successfully!");
            System.out.println("🌐 Try the API at: http://localhost:8080/api/dynamic/collections/products/documents");
            
        } catch (Exception e) {
            System.out.println("⚠️ Demo data creation skipped (might already exist): " + e.getMessage());
        }
    }
}
