package com.udea.banktransfer.entity;

/**
 * Enumeration representing the execution status of a monetary transaction.
 */
public enum TransactionStatus {
    /** Transaction completed successfully and balances updated. */
    SUCCESS,
    /** Transaction failed due to operational issues or insufficient balance. */
    FAILED,
    /** Transaction rejected due to invalid account status or fraud checks. */
    REJECTED
}
