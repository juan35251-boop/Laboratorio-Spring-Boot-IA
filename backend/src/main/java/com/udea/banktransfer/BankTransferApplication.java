package com.udea.banktransfer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Bank Transfer Spring Boot application.
 */
@SpringBootApplication
public class BankTransferApplication {

    /**
     * Application bootstrap method.
     *
     * @param args command-line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(BankTransferApplication.class, args);
    }
}
