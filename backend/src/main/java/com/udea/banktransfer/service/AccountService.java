package com.udea.banktransfer.service;

import com.udea.banktransfer.dto.AccountResponseDTO;
import com.udea.banktransfer.entity.Account;
import java.util.List;

/**
 * Service interface defining operations related to bank accounts.
 */
public interface AccountService {

    /**
     * Retrieves all accounts registered in the bank.
     *
     * @return list of account response DTOs
     */
    List<AccountResponseDTO> getAllAccounts();

    /**
     * Retrieves a single account by its account number.
     *
     * @param accountNumber the unique account identifier
     * @return the account response DTO
     */
    AccountResponseDTO getAccountByNumber(String accountNumber);

    /**
     * Internal lookup method returning the underlying JPA entity.
     *
     * @param accountNumber the account number
     * @return the {@link Account} entity
     */
    Account getAccountEntity(String accountNumber);

    /**
     * Seeds initial demonstration accounts if the database is currently empty.
     */
    void seedInitialAccountsIfEmpty();
}
