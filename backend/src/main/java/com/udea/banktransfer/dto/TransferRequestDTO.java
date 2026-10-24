package com.udea.banktransfer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

/**
 * Record representing the request payload to transfer money between accounts.
 *
 * @param sourceAccountNumber the originating account number
 * @param destinationAccountNumber the target destination account number
 * @param amount the monetary amount to transfer (must be strictly positive)
 * @param description optional concept or transfer note
 */
@Schema(description = "Request model to execute a money transfer between bank accounts")
public record TransferRequestDTO(
        @Schema(description = "Origin account number", example = "CTA-1001-SAVINGS")
        @NotBlank(message = "Source account number is required")
        String sourceAccountNumber,

        @Schema(description = "Destination account number", example = "CTA-2002-CHECKING")
        @NotBlank(message = "Destination account number is required")
        String destinationAccountNumber,

        @Schema(description = "Monetary amount to transfer", example = "150000.00")
        @NotNull(message = "Transfer amount is required")
        @DecimalMin(value = "0.01", message = "Transfer amount must be greater than zero")
        BigDecimal amount,

        @Schema(description = "Optional transfer concept or reference description", example = "Pago de servicios y honorarios")
        String description
) {
}
