package com.udea.banktransfer.exception;

import com.udea.banktransfer.entity.AccountStatus;

/**
 * Thrown when attempting an operation on an account whose status is not ACTIVE.
 */
public class AccountBlockedException extends BankException {

    /**
     * Constructs the exception specifying the account and its current status.
     *
     * @param accountNumber the account number
     * @param status current status of the account
     */
    public AccountBlockedException(String accountNumber, AccountStatus status) {
        super(String.format("Account '%s' cannot perform transactions because its status is %s.", accountNumber, status));
    }
}
