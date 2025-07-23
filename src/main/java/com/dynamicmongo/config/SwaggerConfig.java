package com.dynamicmongo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Dynamic MongoDB CRUD API")
                        .description("A dynamic MongoDB CRUD system that allows creating collections and documents with flexible schemas")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Dynamic MongoDB CRUD Team")
                                .email("support@dynamicmongo.com")
                                .url("https://github.com/your-repo/dynamic-mongo-crud"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8080")
                                .description("Development Server"),
                        new Server()
                                .url("https://api.dynamicmongo.com")
                                .description("Production Server")
                ));
    }
}
