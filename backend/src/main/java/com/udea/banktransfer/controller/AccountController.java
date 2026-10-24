package com.udea.banktransfer.controller;

import com.udea.banktransfer.dto.AccountResponseDTO;
import com.udea.banktransfer.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller exposing endpoints to consult bank accounts and their balances.
 */
@RestController
@RequestMapping("/api/accounts")
@Tag(name = "Accounts", description = "Endpoints for bank account consultation and details")
public class AccountController {

    private final AccountService accountService;

    /**
     * Constructor injection for account service.
     *
     * @param accountService account business service
     */
    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * Lists all registered bank accounts with balances and statuses.
     *
     * @return 200 OK with list of accounts
     */
    @Operation(summary = "List all accounts", description = "Retrieves all bank accounts registered in the system")
    @ApiResponse(responseCode = "200", description = "Accounts retrieved successfully")
    @GetMapping
    public ResponseEntity<List<AccountResponseDTO>> listAllAccounts() {
        List<AccountResponseDTO> accounts = accountService.getAllAccounts();
        return ResponseEntity.ok(accounts);
    }

    /**
     * Retrieves account information for a specific account number.
     *
     * @param accountNumber unique account number
     * @return 200 OK with account details or 404 if not found
     */
    @Operation(summary = "Get account by number", description = "Retrieves account information and balance by account number")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Account found"),
            @ApiResponse(responseCode = "404", description = "Account not found")
    })
    @GetMapping("/{accountNumber}")
    public ResponseEntity<AccountResponseDTO> getAccountByNumber(@PathVariable String accountNumber) {
        AccountResponseDTO account = accountService.getAccountByNumber(accountNumber);
        return ResponseEntity.ok(account);
    }
}
