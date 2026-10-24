package com.udea.banktransfer.exception;

import java.math.BigDecimal;

/**
 * Thrown when an account does not hold sufficient available funds to complete a transfer.
 */
public class InsufficientFundsException extends BankException {

    /**
     * Constructs the exception specifying the account, available balance, and requested amount.
     *
     * @param accountNumber the originating account number
     * @param availableBalance current account balance
     * @param requestedAmount attempted transfer amount
     */
    public InsufficientFundsException(String accountNumber, BigDecimal availableBalance, BigDecimal requestedAmount) {
        super(String.format("Insufficient funds in account '%s'. Current balance is %s, but attempted transfer is %s.",
                accountNumber, availableBalance, requestedAmount));
    }
}
