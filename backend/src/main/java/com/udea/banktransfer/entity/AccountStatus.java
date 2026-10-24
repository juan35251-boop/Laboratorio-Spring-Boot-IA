package com.udea.banktransfer.entity;

/**
 * Enumeration representing the possible statuses of a bank account.
 */
public enum AccountStatus {
    /** Account is active and can perform debits and credits. */
    ACTIVE,
    /** Account is temporarily blocked and cannot perform transfers. */
    BLOCKED,
    /** Account is inactive or closed. */
    INACTIVE
}
