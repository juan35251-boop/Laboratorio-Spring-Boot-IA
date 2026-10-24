package com.udea.banktransfer.exception;

/**
 * Thrown when transfer parameters violate banking rules (e.g., origin equals destination).
 */
public class InvalidTransferException extends BankException {

    /**
     * Constructs the exception with a specific explanation.
     *
     * @param message reason why the transfer is invalid
     */
    public InvalidTransferException(String message) {
        super(message);
    }
}
