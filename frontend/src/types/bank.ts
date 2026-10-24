export type AccountType = 'SAVINGS' | 'CHECKING';
export type AccountStatus = 'ACTIVE' | 'BLOCKED' | 'INACTIVE';
export type TransactionStatus = 'SUCCESS' | 'FAILED' | 'REJECTED';

export interface Account {
  id: number;
  accountNumber: string;
  accountHolder: string;
  accountType: AccountType;
  balance: number;
  status: AccountStatus;
  createdAt: string;
}

export interface TransferRequest {
  sourceAccountNumber: string;
  destinationAccountNumber: string;
  amount: number;
  description: string;
}

export interface TransferResponse {
  id: number;
  transactionReference: string;
  sourceAccountNumber: string;
  sourceAccountHolder: string;
  destinationAccountNumber: string;
  destinationAccountHolder: string;
  amount: number;
  description: string;
  timestamp: string;
  status: TransactionStatus;
  sourceRemainingBalance?: number;
  qrCodeData: string;
  qrCodeBase64: string;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}
