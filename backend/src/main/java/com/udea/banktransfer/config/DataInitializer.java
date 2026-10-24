package com.udea.banktransfer.config;

import com.udea.banktransfer.service.AccountService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class initializing default bank accounts on application startup.
 */
@Configuration
public class DataInitializer {

    /**
     * Seeds sample bank accounts upon startup if the account table is empty.
     *
     * @param accountService the account service
     * @return {@link CommandLineRunner} executed at boot time
     */
    @Bean
    public CommandLineRunner initData(AccountService accountService) {
        return args -> {
            accountService.seedInitialAccountsIfEmpty();
        };
    }
}
