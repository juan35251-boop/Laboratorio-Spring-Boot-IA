package com.udea.banktransfer.config;

import com.udea.banktransfer.entity.Account;
import com.udea.banktransfer.entity.AccountStatus;
import com.udea.banktransfer.entity.AccountType;
import com.udea.banktransfer.entity.Transaction;
import com.udea.banktransfer.entity.TransactionStatus;
import com.udea.banktransfer.repository.AccountRepository;
import com.udea.banktransfer.repository.TransactionRepository;
import com.udea.banktransfer.service.QrCodeService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Configuration class initializing default bank accounts and historical test transactions.
 */
@Configuration
public class DataInitializer {

    /**
     * Seeds initial test data (accounts and transactions with QR codes) if the database is currently empty.
     *
     * @param accountRepository account repository
     * @param transactionRepository transaction repository
     * @param qrCodeService QR generator service
     * @return {@link CommandLineRunner} executed at boot time
     */
    @Bean
    public CommandLineRunner initData(AccountRepository accountRepository,
                                      TransactionRepository transactionRepository,
                                      QrCodeService qrCodeService,
                                      com.udea.banktransfer.service.VoucherViewService voucherViewService) {
        return args -> {
            // 1. Seed Accounts
            if (accountRepository.count() == 0) {
                accountRepository.save(new Account(
                        "CTA-1001-SAVINGS",
                        "Carlos Gómez Restrepo",
                        "Banco TdeA",
                        AccountType.SAVINGS,
                        new BigDecimal("4200000.00"),
                        AccountStatus.ACTIVE
                ));

                accountRepository.save(new Account(
                        "CTA-2002-CHECKING",
                        "María Camila Rodríguez",
                        "Banco TdeA",
                        AccountType.CHECKING,
                        new BigDecimal("3630000.00"),
                        AccountStatus.ACTIVE
                ));

                accountRepository.save(new Account(
                        "CTA-3003-SAVINGS",
                        "Juan Fernando Pérez",
                        "Banco TdeA",
                        AccountType.SAVINGS,
                        new BigDecimal("1660000.00"),
                        AccountStatus.ACTIVE
                ));

                accountRepository.save(new Account(
                        "CTA-4004-SAVINGS",
                        "Valentina Morales",
                        "Banco TdeA",
                        AccountType.SAVINGS,
                        new BigDecimal("1010000.00"),
                        AccountStatus.ACTIVE
                ));
            }

            // 2. Seed Rich Historical Transactions with real QR Codes
            if (transactionRepository.count() == 0) {
                createSeedTransaction(
                        transactionRepository,
                        qrCodeService,
                        voucherViewService,
                        "TXN-20261022-894101",
                        "CTA-1001-SAVINGS",
                        "Carlos Gómez Restrepo",
                        "CTA-2002-CHECKING",
                        "María Camila Rodríguez",
                        new BigDecimal("450000.00"),
                        "Pago de honorarios asesoría contable",
                        LocalDateTime.now().minusDays(2).minusHours(5)
                );

                createSeedTransaction(
                        transactionRepository,
                        qrCodeService,
                        voucherViewService,
                        "TXN-20261022-921473",
                        "CTA-2002-CHECKING",
                        "María Camila Rodríguez",
                        "CTA-3003-SAVINGS",
                        "Juan Fernando Pérez",
                        new BigDecimal("280000.00"),
                        "Diseño interfaz web plataforma e-commerce",
                        LocalDateTime.now().minusDays(2).minusHours(1)
                );

                createSeedTransaction(
                        transactionRepository,
                        qrCodeService,
                        voucherViewService,
                        "TXN-20261023-110294",
                        "CTA-3003-SAVINGS",
                        "Juan Fernando Pérez",
                        "CTA-4004-SAVINGS",
                        "Valentina Morales",
                        new BigDecimal("120000.00"),
                        "Cuota compartida proyecto taller IA",
                        LocalDateTime.now().minusDays(1).minusHours(4)
                );

                createSeedTransaction(
                        transactionRepository,
                        qrCodeService,
                        voucherViewService,
                        "TXN-20261023-164831",
                        "CTA-1001-SAVINGS",
                        "Carlos Gómez Restrepo",
                        "CTA-4004-SAVINGS",
                        "Valentina Morales",
                        new BigDecimal("350000.00"),
                        "Apoyo manutención semestre académico",
                        LocalDateTime.now().minusDays(1).minusHours(2)
                );

                createSeedTransaction(
                        transactionRepository,
                        qrCodeService,
                        voucherViewService,
                        "TXN-20261024-082019",
                        "CTA-4004-SAVINGS",
                        "Valentina Morales",
                        "CTA-2002-CHECKING",
                        "María Camila Rodríguez",
                        new BigDecimal("95000.00"),
                        "Compra de material bibliográfico ingeniería",
                        LocalDateTime.now().minusHours(6)
                );

                createSeedTransaction(
                        transactionRepository,
                        qrCodeService,
                        voucherViewService,
                        "TXN-20261024-114255",
                        "CTA-2002-CHECKING",
                        "María Camila Rodríguez",
                        "CTA-1001-SAVINGS",
                        "Carlos Gómez Restrepo",
                        new BigDecimal("500000.00"),
                        "Devolución anticipo contrato servicios",
                        LocalDateTime.now().minusHours(2)
                );
            }
        };
    }

    private void createSeedTransaction(TransactionRepository repo,
                                       QrCodeService qrCodeService,
                                       com.udea.banktransfer.service.VoucherViewService voucherViewService,
                                       String reference,
                                       String sourceAcc,
                                       String sourceHolder,
                                       String destAcc,
                                       String destHolder,
                                       BigDecimal amount,
                                       String description,
                                       LocalDateTime time) {
        String voucherUrl = voucherViewService.getVoucherUrl(reference);
        String qrBase64 = qrCodeService.generateQrCodeBase64(voucherUrl);

        Transaction transaction = new Transaction(
                reference,
                sourceAcc,
                destAcc,
                "Banco TdeA",
                amount,
                description,
                TransactionStatus.SUCCESS,
                voucherUrl,
                qrBase64
        );
        transaction.setTimestamp(time);
        repo.save(transaction);
    }
}
