package com.dynamicmongo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.data.mongodb.uri=mongodb://localhost:27017/test_dynamic_db",
    "spring.kafka.bootstrap-servers="
})
class DynamicMongoApplicationTest {

    @Test
    void contextLoads() {
        // Test that Spring context loads successfully
    }
}
