package com.udea.banktransfer.repository;

import com.udea.banktransfer.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Account} entities.
 */
@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {

    /**
     * Finds an account by its unique account number.
     *
     * @param accountNumber the unique account number string
     * @return an {@link Optional} containing the account if found, or empty otherwise
     */
    Optional<Account> findByAccountNumber(String accountNumber);

    /**
     * Checks if an account exists with the specified account number.
     *
     * @param accountNumber the unique account number string
     * @return true if the account exists, false otherwise
     */
    boolean existsByAccountNumber(String accountNumber);
}
