package com.udea.banktransfer.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a monetary transfer transaction between two bank accounts.
 */
@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_reference", nullable = false, unique = true, length = 64)
    private String transactionReference;

    @Column(name = "source_account_number", nullable = false, length = 30)
    private String sourceAccountNumber;

    @Column(name = "destination_account_number", nullable = false, length = 30)
    private String destinationAccountNumber;

    @Column(name = "amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "bank_name", length = 80)
    private String bankName = "Banco TdeA";

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private TransactionStatus status;

    @Column(name = "qr_code_data", columnDefinition = "TEXT")
    private String qrCodeData;

    @Lob
    @Column(name = "qr_code_base64", columnDefinition = "TEXT")
    private String qrCodeBase64;

    /**
     * Default constructor required by JPA.
     */
    public Transaction() {
    }

    /**
     * Parameterized constructor to initialize a transaction.
     *
     * @param transactionReference unique reference code
     * @param sourceAccountNumber account from which money was transferred
     * @param destinationAccountNumber account receiving the money
     * @param amount monetary value transferred
     * @param description transfer concept or note
     * @param status operational status
     * @param qrCodeData JSON or text payload encoded in the QR code
     * @param qrCodeBase64 Base64 string of the QR code PNG image
     */
    public Transaction(String transactionReference, String sourceAccountNumber,
                       String destinationAccountNumber, BigDecimal amount, String description,
                       TransactionStatus status, String qrCodeData, String qrCodeBase64) {
        this(transactionReference, sourceAccountNumber, destinationAccountNumber, "Banco TdeA",
                amount, description, status, qrCodeData, qrCodeBase64);
    }

    public Transaction(String transactionReference, String sourceAccountNumber,
                       String destinationAccountNumber, String bankName, BigDecimal amount, String description,
                       TransactionStatus status, String qrCodeData, String qrCodeBase64) {
        this.transactionReference = transactionReference;
        this.sourceAccountNumber = sourceAccountNumber;
        this.destinationAccountNumber = destinationAccountNumber;
        this.bankName = bankName != null ? bankName : "Banco TdeA";
        this.amount = amount;
        this.description = description;
        this.status = status;
        this.qrCodeData = qrCodeData;
        this.qrCodeBase64 = qrCodeBase64;
        this.timestamp = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public String getSourceAccountNumber() {
        return sourceAccountNumber;
    }

    public void setSourceAccountNumber(String sourceAccountNumber) {
        this.sourceAccountNumber = sourceAccountNumber;
    }

    public String getDestinationAccountNumber() {
        return destinationAccountNumber;
    }

    public void setDestinationAccountNumber(String destinationAccountNumber) {
        this.destinationAccountNumber = destinationAccountNumber;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public TransactionStatus getStatus() {
        return status;
    }

    public void setStatus(TransactionStatus status) {
        this.status = status;
    }

    public String getQrCodeData() {
        return qrCodeData;
    }

    public void setQrCodeData(String qrCodeData) {
        this.qrCodeData = qrCodeData;
    }

    public String getQrCodeBase64() {
        return qrCodeBase64;
    }

    public void setQrCodeBase64(String qrCodeBase64) {
        this.qrCodeBase64 = qrCodeBase64;
    }
}
