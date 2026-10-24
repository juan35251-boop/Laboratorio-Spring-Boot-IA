package com.udea.banktransfer.repository;

import com.udea.banktransfer.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Transaction} entities.
 */
@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    /**
     * Finds a transaction by its unique reference code.
     *
     * @param transactionReference the unique transaction reference
     * @return an {@link Optional} containing the transaction if found
     */
    Optional<Transaction> findByTransactionReference(String transactionReference);

    /**
     * Retrieves all transactions ordered by execution timestamp descending (most recent first).
     *
     * @return list of transactions ordered chronologically descending
     */
    List<Transaction> findAllByOrderByTimestampDesc();

    /**
     * Retrieves transactions where the account was either the source or destination, ordered by timestamp descending.
     *
     * @param sourceAccountNumber account number acting as sender
     * @param destinationAccountNumber account number acting as receiver
     * @return list of matching transactions
     */
    List<Transaction> findBySourceAccountNumberOrDestinationAccountNumberOrderByTimestampDesc(
            String sourceAccountNumber, String destinationAccountNumber);
}
