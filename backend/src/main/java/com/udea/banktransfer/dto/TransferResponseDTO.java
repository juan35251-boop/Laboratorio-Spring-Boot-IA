package com.udea.banktransfer.dto;

import com.udea.banktransfer.entity.TransactionStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Record representing the completed transaction response, including encoded QR data and Base64 image.
 *
 * @param id transaction database identifier
 * @param transactionReference unique alphanumeric transaction receipt code
 * @param sourceAccountNumber sender account number
 * @param sourceAccountHolder sender account holder name
 * @param destinationAccountNumber receiver account number
 * @param destinationAccountHolder receiver account holder name
 * @param amount monetary value transferred
 * @param description transfer concept note
 * @param timestamp exact date and time of execution
 * @param status final execution status
 * @param sourceRemainingBalance sender balance remaining after transfer
 * @param qrCodeData readable JSON/text string encoded in the QR code
 * @param qrCodeBase64 Base64 PNG data URL of the generated QR code
 */
@Schema(description = "Response model representing the transaction receipt with QR Code details")
public record TransferResponseDTO(
        @Schema(description = "Transaction ID", example = "1")
        Long id,

        @Schema(description = "Unique transaction reference", example = "TXN-A3B9-20261030")
        String transactionReference,

        @Schema(description = "Origin account number", example = "CTA-1001-SAVINGS")
        String sourceAccountNumber,

        @Schema(description = "Origin account holder name", example = "Carlos Gomez")
        String sourceAccountHolder,

        @Schema(description = "Destination account number", example = "CTA-2002-CHECKING")
        String destinationAccountNumber,

        @Schema(description = "Destination account holder name", example = "Maria Rodriguez")
        String destinationAccountHolder,

        @Schema(description = "Bank entity name", example = "Banco TdeA")
        String bankName,

        @Schema(description = "Amount transferred", example = "150000.00")
        BigDecimal amount,

        @Schema(description = "Transfer description", example = "Pago de servicios y honorarios")
        String description,

        @Schema(description = "Timestamp of the transaction", example = "2026-10-30T10:15:30")
        LocalDateTime timestamp,

        @Schema(description = "Transaction status", example = "SUCCESS")
        TransactionStatus status,

        @Schema(description = "Source remaining balance", example = "4850000.00")
        BigDecimal sourceRemainingBalance,

        @Schema(description = "Textual data encoded inside the QR code")
        String qrCodeData,

        @Schema(description = "Base64 data URL for the generated QR code image (ready for <img src=...>)")
        String qrCodeBase64
) {
}
