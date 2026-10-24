package com.udea.banktransfer.dto;

import com.udea.banktransfer.entity.AccountStatus;
import com.udea.banktransfer.entity.AccountType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Record representing the public profile and balance of a bank account.
 *
 * @param id account database identifier
 * @param accountNumber unique account number
 * @param accountHolder customer name
 * @param accountType savings or checking
 * @param balance current monetary balance
 * @param status operational status
 * @param createdAt creation timestamp
 */
@Schema(description = "Account information and current balance")
public record AccountResponseDTO(
        @Schema(description = "Account ID", example = "1")
        Long id,

        @Schema(description = "Account number", example = "CTA-1001-SAVINGS")
        String accountNumber,

        @Schema(description = "Account holder name", example = "Carlos Gomez")
        String accountHolder,

        @Schema(description = "Account type", example = "SAVINGS")
        AccountType accountType,

        @Schema(description = "Current account balance", example = "5000000.00")
        BigDecimal balance,

        @Schema(description = "Account status", example = "ACTIVE")
        AccountStatus status,

        @Schema(description = "Account creation timestamp", example = "2026-10-24T12:00:00")
        LocalDateTime createdAt
) {
}
