package com.udea.banktransfer.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class defining the OpenAPI 3.0 specification metadata for Swagger UI.
 */
@Configuration
public class OpenApiConfig {

    /**
     * Builds and configures the OpenAPI specification instance.
     *
     * @return custom {@link OpenAPI} specification
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API de Transferencias Bancarias con Código QR - Tecnológico de Antioquia")
                        .version("1.0.0")
                        .description("Servicio RESTful en Spring Boot para traslado de dinero entre cuentas bancarias, " +
                                "consulta de historial de transacciones y generación de códigos QR para validación de operaciones.")
                        .contact(new Contact()
                                .name("Laboratorio FullStack - Tecnológico de Antioquia")
                                .url("https://www.tdea.edu.co"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://spring.io")));
    }
}
