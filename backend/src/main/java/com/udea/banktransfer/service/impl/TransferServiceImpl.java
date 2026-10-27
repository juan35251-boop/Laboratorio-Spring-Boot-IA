package com.udea.banktransfer.service.impl;

import com.udea.banktransfer.dto.TransferRequestDTO;
import com.udea.banktransfer.dto.TransferResponseDTO;
import com.udea.banktransfer.entity.Account;
import com.udea.banktransfer.entity.AccountStatus;
import com.udea.banktransfer.entity.Transaction;
import com.udea.banktransfer.entity.TransactionStatus;
import com.udea.banktransfer.exception.AccountBlockedException;
import com.udea.banktransfer.exception.AccountNotFoundException;
import com.udea.banktransfer.exception.InsufficientFundsException;
import com.udea.banktransfer.exception.InvalidTransferException;
import com.udea.banktransfer.repository.AccountRepository;
import com.udea.banktransfer.repository.TransactionRepository;
import com.udea.banktransfer.service.QrCodeService;
import com.udea.banktransfer.service.TransferService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * Implementation of {@link TransferService} orchestrating validation, atomic balance transfers, and QR generation.
 */
@Service
public class TransferServiceImpl implements TransferService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final QrCodeService qrCodeService;
    private final com.udea.banktransfer.service.VoucherViewService voucherViewService;

    /**
     * Constructor injection for required repositories, QR generator service, and voucher view service.
     *
     * @param accountRepository account repository
     * @param transactionRepository transaction repository
     * @param qrCodeService QR generator service
     * @param voucherViewService voucher HTML rendering service
     */
    @org.springframework.beans.factory.annotation.Autowired
    public TransferServiceImpl(AccountRepository accountRepository,
                               TransactionRepository transactionRepository,
                               QrCodeService qrCodeService,
                               com.udea.banktransfer.service.VoucherViewService voucherViewService) {
        this.accountRepository = accountRepository;
        this.transactionRepository = transactionRepository;
        this.qrCodeService = qrCodeService;
        this.voucherViewService = voucherViewService;
    }

    /**
     * Secondary constructor for tests and backward compatibility.
     */
    public TransferServiceImpl(AccountRepository accountRepository,
                               TransactionRepository transactionRepository,
                               QrCodeService qrCodeService) {
        this(accountRepository, transactionRepository, qrCodeService, new com.udea.banktransfer.service.VoucherViewService());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public TransferResponseDTO executeTransfer(TransferRequestDTO request) {
        // 1. Validation: Origin and destination must not be the same account
        if (request.sourceAccountNumber().trim().equalsIgnoreCase(request.destinationAccountNumber().trim())) {
            throw new InvalidTransferException("Source and destination accounts cannot be identical.");
        }

        // 2. Validation: Amount must be greater than zero
        if (request.amount() == null || request.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidTransferException("Transfer amount must be strictly greater than zero.");
        }

        // 3. Retrieval of source account
        Account sourceAccount = accountRepository.findByAccountNumber(request.sourceAccountNumber().trim())
                .orElseThrow(() -> new AccountNotFoundException(request.sourceAccountNumber()));

        // 4. Retrieval of destination account
        Account destinationAccount = accountRepository.findByAccountNumber(request.destinationAccountNumber().trim())
                .orElseThrow(() -> new AccountNotFoundException(request.destinationAccountNumber()));

        // 5. Account status validation
        if (sourceAccount.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountBlockedException(sourceAccount.getAccountNumber(), sourceAccount.getStatus());
        }
        if (destinationAccount.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountBlockedException(destinationAccount.getAccountNumber(), destinationAccount.getStatus());
        }

        // 6. Sufficient balance validation
        if (sourceAccount.getBalance().compareTo(request.amount()) < 0) {
            throw new InsufficientFundsException(sourceAccount.getAccountNumber(), sourceAccount.getBalance(), request.amount());
        }

        // 7. Atomic balance balance modification
        sourceAccount.setBalance(sourceAccount.getBalance().subtract(request.amount()));
        destinationAccount.setBalance(destinationAccount.getBalance().add(request.amount()));

        accountRepository.save(sourceAccount);
        accountRepository.save(destinationAccount);

        // 8. Generate unique transaction reference code
        String reference = "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        LocalDateTime now = LocalDateTime.now();
        String formattedDate = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));

        // 9. Resolve bank entity and voucher verification URL
        String bankName = (sourceAccount.getBankName() != null && !sourceAccount.getBankName().isBlank())
                ? sourceAccount.getBankName()
                : "Banco TdeA";

        String description = (request.description() != null && !request.description().isBlank())
                ? request.description().trim()
                : "Traslado de fondos entre cuentas";

        String voucherUrl = voucherViewService.getVoucherUrl(reference);

        // 10. Construct complete structured payload with all basic transaction data encoded (Requisito Taller)
        String qrContent = String.format(
                """
                === BANCO TdeA - TRASLADO DE DINERO ===
                Referencia: %s
                Fecha y Hora: %s
                Entidad Bancaria: %s
                Cuenta Origen: %s (%s)
                Cuenta Destino: %s (%s)
                Monto Transferido: $ %,.2f COP
                Concepto: %s
                Estado: %s (APROBADA)
                Comprobante Oficial PDF: %s
                """.trim(),
                reference,
                formattedDate,
                bankName,
                sourceAccount.getAccountNumber(),
                sourceAccount.getAccountHolder(),
                destinationAccount.getAccountNumber(),
                destinationAccount.getAccountHolder(),
                request.amount(),
                description,
                TransactionStatus.SUCCESS,
                voucherUrl
        );

        // 11. Generate QR Code image encoding all basic transaction data
        String qrBase64 = qrCodeService.generateQrCodeBase64(qrContent);

        // 12. Persist transaction record
        Transaction transaction = new Transaction(
                reference,
                sourceAccount.getAccountNumber(),
                destinationAccount.getAccountNumber(),
                bankName,
                request.amount(),
                description,
                TransactionStatus.SUCCESS,
                qrContent,
                qrBase64
        );
        transaction.setTimestamp(now);
        Transaction saved = transactionRepository.save(transaction);

        // 13. Return full response DTO
        return new TransferResponseDTO(
                saved.getId(),
                saved.getTransactionReference(),
                sourceAccount.getAccountNumber(),
                sourceAccount.getAccountHolder(),
                destinationAccount.getAccountNumber(),
                destinationAccount.getAccountHolder(),
                saved.getBankName(),
                saved.getAmount(),
                saved.getDescription(),
                saved.getTimestamp(),
                saved.getStatus(),
                sourceAccount.getBalance(),
                saved.getQrCodeData(),
                saved.getQrCodeBase64(),
                voucherUrl
        );
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public List<TransferResponseDTO> getAllTransactions() {
        return transactionRepository.findAllByOrderByTimestampDesc().stream()
                .map(this::mapTransactionToDTO)
                .toList();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public TransferResponseDTO getTransactionByReference(String reference) {
        Transaction transaction = transactionRepository.findByTransactionReference(reference)
                .orElseThrow(() -> new InvalidTransferException("Transaction with reference '" + reference + "' not found."));
        return mapTransactionToDTO(transaction);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public byte[] getTransactionQrImage(Long transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new InvalidTransferException("Transaction ID '" + transactionId + "' not found."));
        return qrCodeService.generateQrCodeImageBytes(transaction.getQrCodeData(), 300, 300);
    }

    private TransferResponseDTO mapTransactionToDTO(Transaction t) {
        String sourceHolder = accountRepository.findByAccountNumber(t.getSourceAccountNumber())
                .map(Account::getAccountHolder).orElse("Desconocido");
        String destHolder = accountRepository.findByAccountNumber(t.getDestinationAccountNumber())
                .map(Account::getAccountHolder).orElse("Desconocido");

        String voucherUrl = (t.getQrCodeData() != null && t.getQrCodeData().startsWith("http"))
                ? t.getQrCodeData()
                : voucherViewService.getVoucherUrl(t.getTransactionReference());

        return new TransferResponseDTO(
                t.getId(),
                t.getTransactionReference(),
                t.getSourceAccountNumber(),
                sourceHolder,
                t.getDestinationAccountNumber(),
                destHolder,
                t.getBankName(),
                t.getAmount(),
                t.getDescription(),
                t.getTimestamp(),
                t.getStatus(),
                null,
                t.getQrCodeData(),
                t.getQrCodeBase64(),
                voucherUrl
        );
    }
}
