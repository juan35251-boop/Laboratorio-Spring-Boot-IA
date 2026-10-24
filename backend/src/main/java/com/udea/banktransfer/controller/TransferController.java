package com.udea.banktransfer.controller;

import com.udea.banktransfer.dto.TransferRequestDTO;
import com.udea.banktransfer.dto.TransferResponseDTO;
import com.udea.banktransfer.service.TransferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller exposing endpoints to execute money transfers, consult transaction history, and download QR codes.
 */
@RestController
@RequestMapping("/api/transfers")
@Tag(name = "Transfers", description = "Endpoints to process money transfers, retrieve transaction history, and access QR codes")
public class TransferController {

    private final TransferService transferService;

    /**
     * Constructor injection for transfer service.
     *
     * @param transferService transfer business service
     */
    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    /**
     * Executes a money transfer between two bank accounts.
     *
     * @param request the transfer request payload
     * @return 201 Created with transfer receipt and generated QR code details
     */
    @Operation(summary = "Execute money transfer", description = "Transfers money atomically between two accounts and generates a transaction receipt with QR Code")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Transfer completed successfully",
                    content = @Content(schema = @Schema(implementation = TransferResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Invalid transfer request parameters"),
            @ApiResponse(responseCode = "404", description = "Source or destination account not found"),
            @ApiResponse(responseCode = "409", description = "Insufficient funds in source account")
    })
    @PostMapping
    public ResponseEntity<TransferResponseDTO> createTransfer(@Valid @RequestBody TransferRequestDTO request) {
        TransferResponseDTO response = transferService.executeTransfer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Retrieves the complete historical log of all transactions executed in the bank.
     *
     * @return 200 OK with list of past transactions ordered newest first
     */
    @Operation(summary = "Transaction history", description = "Returns the historical list of all transfers performed in descending chronological order")
    @ApiResponse(responseCode = "200", description = "Transaction history retrieved successfully")
    @GetMapping
    public ResponseEntity<List<TransferResponseDTO>> getTransactionHistory() {
        List<TransferResponseDTO> history = transferService.getAllTransactions();
        return ResponseEntity.ok(history);
    }

    /**
     * Retrieves the details of a single transaction by its unique reference.
     *
     * @param reference the transaction reference code
     * @return 200 OK with the transaction receipt
     */
    @Operation(summary = "Get transaction by reference", description = "Retrieves the receipt details for a transaction by reference code")
    @GetMapping("/{reference}")
    public ResponseEntity<TransferResponseDTO> getTransactionByReference(@PathVariable String reference) {
        TransferResponseDTO response = transferService.getTransactionByReference(reference);
        return ResponseEntity.ok(response);
    }

    /**
     * Returns the PNG image representation of the transaction QR code.
     *
     * @param id transaction database ID
     * @return PNG image bytes with Content-Type image/png
     */
    @Operation(summary = "Get QR Code image", description = "Returns a raw PNG image of the QR Code encoding the transaction information")
    @GetMapping(value = "/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getTransactionQrImage(@PathVariable Long id) {
        byte[] imageBytes = transferService.getTransactionQrImage(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
    }
}
