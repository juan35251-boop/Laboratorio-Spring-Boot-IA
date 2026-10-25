package com.udea.banktransfer.service.impl;

import com.udea.banktransfer.dto.AccountResponseDTO;
import com.udea.banktransfer.entity.Account;
import com.udea.banktransfer.entity.AccountStatus;
import com.udea.banktransfer.entity.AccountType;
import com.udea.banktransfer.exception.AccountNotFoundException;
import com.udea.banktransfer.repository.AccountRepository;
import com.udea.banktransfer.service.AccountService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

/**
 * Implementation of {@link AccountService} managing persistence and retrieval of bank accounts.
 */
@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;

    /**
     * Constructor injection for required dependencies.
     *
     * @param accountRepository account data repository
     */
    public AccountServiceImpl(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<AccountResponseDTO> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(this::mapToDTO)
                .toList();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public AccountResponseDTO getAccountByNumber(String accountNumber) {
        Account account = getAccountEntity(accountNumber);
        return mapToDTO(account);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public Account getAccountEntity(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public void seedInitialAccountsIfEmpty() {
        if (accountRepository.count() == 0) {
            accountRepository.save(new Account(
                    "CTA-1001-SAVINGS",
                    "Carlos Gómez Restrepo",
                    AccountType.SAVINGS,
                    new BigDecimal("5000000.00"),
                    AccountStatus.ACTIVE
            ));

            accountRepository.save(new Account(
                    "CTA-2002-CHECKING",
                    "María Camila Rodríguez",
                    AccountType.CHECKING,
                    new BigDecimal("3200000.00"),
                    AccountStatus.ACTIVE
            ));

            accountRepository.save(new Account(
                    "CTA-3003-SAVINGS",
                    "Juan Fernando Pérez",
                    AccountType.SAVINGS,
                    new BigDecimal("1500000.00"),
                    AccountStatus.ACTIVE
            ));

            accountRepository.save(new Account(
                    "CTA-4004-SAVINGS",
                    "Valentina Morales",
                    AccountType.SAVINGS,
                    new BigDecimal("800000.00"),
                    AccountStatus.ACTIVE
            ));
        }
    }

    private AccountResponseDTO mapToDTO(Account account) {
        return new AccountResponseDTO(
                account.getId(),
                account.getAccountNumber(),
                account.getAccountHolder(),
                account.getBankName(),
                account.getAccountType(),
                account.getBalance(),
                account.getStatus(),
                account.getCreatedAt()
        );
    }
}
