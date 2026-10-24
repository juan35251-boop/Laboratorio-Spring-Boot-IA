package com.udea.banktransfer.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

/**
 * Record representing a standardized API error response.
 *
 * @param timestamp timestamp when the error occurred
 * @param status HTTP response status code
 * @param error HTTP status reason phrase
 * @param message human-readable detailed error message
 * @param path request URI path that triggered the error
 */
@Schema(description = "Standard API error response payload")
public record ErrorResponseDTO(
        @Schema(description = "Error timestamp", example = "2026-10-30T10:15:30")
        LocalDateTime timestamp,

        @Schema(description = "HTTP status code", example = "400")
        int status,

        @Schema(description = "Error name", example = "Bad Request")
        String error,

        @Schema(description = "Detailed error description", example = "Insufficient funds in source account")
        String message,

        @Schema(description = "Request path", example = "/api/transfers")
        String path
) {
}
