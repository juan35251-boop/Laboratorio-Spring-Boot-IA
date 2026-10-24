package com.udea.banktransfer.exception;

/**
 * Base abstract runtime exception for banking domain errors.
 */
public abstract class BankException extends RuntimeException {

    /**
     * Constructs a new bank exception with the specified detail message.
     *
     * @param message detail explanation of the business exception
     */
    public BankException(String message) {
        super(message);
    }
}
