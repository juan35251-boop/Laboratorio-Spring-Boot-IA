package com.udea.banktransfer.service;

import com.udea.banktransfer.dto.TransferRequestDTO;
import com.udea.banktransfer.dto.TransferResponseDTO;
import java.util.List;

/**
 * Service interface specifying money transfer execution, query history, and QR generation.
 */
public interface TransferService {

    /**
     * Executes a monetary transfer from a source account to a destination account atomically.
     *
     * @param request transfer request payload containing origin, destination, amount, and concept
     * @return transfer response with transaction receipt and encoded QR code
     */
    TransferResponseDTO executeTransfer(TransferRequestDTO request);

    /**
     * Retrieves the complete transaction history ordered chronologically descending.
     *
     * @return list of transaction response DTOs
     */
    List<TransferResponseDTO> getAllTransactions();

    /**
     * Retrieves a single transaction receipt by its unique reference code.
     *
     * @param reference unique reference code
     * @return transfer response DTO
     */
    TransferResponseDTO getTransactionByReference(String reference);

    /**
     * Generates and returns raw PNG image bytes of the QR code for a specific transaction.
     *
     * @param transactionId transaction database identifier
     * @return PNG image byte array
     */
    byte[] getTransactionQrImage(Long transactionId);
}
