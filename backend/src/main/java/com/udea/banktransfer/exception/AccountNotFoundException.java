package com.udea.banktransfer.exception;

/**
 * Thrown when an account cannot be found by its account number or ID.
 */
public class AccountNotFoundException extends BankException {

    /**
     * Constructs the exception specifying the missing account number.
     *
     * @param accountNumber the requested account number
     */
    public AccountNotFoundException(String accountNumber) {
        super("Bank account with number '" + accountNumber + "' was not found.");
    }
}
