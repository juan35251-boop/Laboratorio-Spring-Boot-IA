package com.udea.banktransfer.service;

import com.udea.banktransfer.dto.TransferRequestDTO;
import com.udea.banktransfer.dto.TransferResponseDTO;
import com.udea.banktransfer.entity.Account;
import com.udea.banktransfer.entity.AccountStatus;
import com.udea.banktransfer.entity.AccountType;
import com.udea.banktransfer.entity.Transaction;
import com.udea.banktransfer.entity.TransactionStatus;
import com.udea.banktransfer.exception.AccountNotFoundException;
import com.udea.banktransfer.exception.InsufficientFundsException;
import com.udea.banktransfer.exception.InvalidTransferException;
import com.udea.banktransfer.repository.AccountRepository;
import com.udea.banktransfer.repository.TransactionRepository;
import com.udea.banktransfer.service.impl.TransferServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransferServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private QrCodeService qrCodeService;

    private TransferService transferService;

    private Account sourceAccount;
    private Account destinationAccount;

    @BeforeEach
    void setUp() {
        transferService = new TransferServiceImpl(accountRepository, transactionRepository, qrCodeService);

        sourceAccount = new Account(
                "CTA-1001",
                "Juan Pérez",
                AccountType.SAVINGS,
                new BigDecimal("1000000.00"),
                AccountStatus.ACTIVE
        );

        destinationAccount = new Account(
                "CTA-2002",
                "María Gómez",
                AccountType.CHECKING,
                new BigDecimal("500000.00"),
                AccountStatus.ACTIVE
        );
    }

    @Test
    @DisplayName("Should transfer money successfully and generate QR Code")
    void shouldExecuteTransferSuccessfully() {
        TransferRequestDTO request = new TransferRequestDTO(
                "CTA-1001",
                "CTA-2002",
                new BigDecimal("200000.00"),
                "Pago alquiler"
        );

        when(accountRepository.findByAccountNumber("CTA-1001")).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findByAccountNumber("CTA-2002")).thenReturn(Optional.of(destinationAccount));
        when(qrCodeService.generateQrCodeBase64(anyString())).thenReturn("data:image/png;base64,mockQrCode");
        when(transactionRepository.save(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction t = invocation.getArgument(0);
            t.setId(1L);
            return t;
        });

        TransferResponseDTO response = transferService.executeTransfer(request);

        assertNotNull(response);
        assertEquals(TransactionStatus.SUCCESS, response.status());
        assertEquals(new BigDecimal("200000.00"), response.amount());
        assertEquals("CTA-1001", response.sourceAccountNumber());
        assertEquals("CTA-2002", response.destinationAccountNumber());
        assertEquals(new BigDecimal("800000.00"), sourceAccount.getBalance());
        assertEquals(new BigDecimal("700000.00"), destinationAccount.getBalance());
        assertNotNull(response.qrCodeBase64());
        assertTrue(response.qrCodeBase64().startsWith("data:image/png;base64,"));

        verify(accountRepository, times(1)).save(sourceAccount);
        verify(accountRepository, times(1)).save(destinationAccount);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    @DisplayName("Should throw InsufficientFundsException when source balance is lower than amount")
    void shouldThrowInsufficientFundsException() {
        TransferRequestDTO request = new TransferRequestDTO(
                "CTA-1001",
                "CTA-2002",
                new BigDecimal("1500000.00"),
                "Transferencia mayor al saldo"
        );

        when(accountRepository.findByAccountNumber("CTA-1001")).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findByAccountNumber("CTA-2002")).thenReturn(Optional.of(destinationAccount));

        assertThrows(InsufficientFundsException.class, () -> transferService.executeTransfer(request));
        verify(transactionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw InvalidTransferException when source and destination are the same")
    void shouldThrowWhenSourceEqualsDestination() {
        TransferRequestDTO request = new TransferRequestDTO(
                "CTA-1001",
                "CTA-1001",
                new BigDecimal("50000.00"),
                "Transferencia a si mismo"
        );

        assertThrows(InvalidTransferException.class, () -> transferService.executeTransfer(request));
        verify(accountRepository, never()).findByAccountNumber(anyString());
    }

    @Test
    @DisplayName("Should throw AccountNotFoundException when destination account does not exist")
    void shouldThrowWhenDestinationAccountNotFound() {
        TransferRequestDTO request = new TransferRequestDTO(
                "CTA-1001",
                "CTA-9999",
                new BigDecimal("50000.00"),
                "Cuenta inexistente"
        );

        when(accountRepository.findByAccountNumber("CTA-1001")).thenReturn(Optional.of(sourceAccount));
        when(accountRepository.findByAccountNumber("CTA-9999")).thenReturn(Optional.empty());

        assertThrows(AccountNotFoundException.class, () -> transferService.executeTransfer(request));
    }
}
