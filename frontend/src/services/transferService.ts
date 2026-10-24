import axios from 'axios';
import { Account, TransferRequest, TransferResponse } from '../types/bank';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

/**
 * Service to handle bank account and money transfer interactions with the Spring Boot backend.
 */
export const TransferService = {
  /**
   * Retrieves all registered accounts.
   */
  async getAccounts(): Promise<Account[]> {
    const response = await apiClient.get<Account[]>('/accounts');
    return response.data;
  },

  /**
   * Retrieves a single account details by account number.
   */
  async getAccount(accountNumber: string): Promise<Account> {
    const response = await apiClient.get<Account>(`/accounts/${encodeURIComponent(accountNumber)}`);
    return response.data;
  },

  /**
   * Executes a money transfer between accounts and receives the transaction receipt with QR code.
   */
  async createTransfer(payload: TransferRequest): Promise<TransferResponse> {
    const response = await apiClient.post<TransferResponse>('/transfers', payload);
    return response.data;
  },

  /**
   * Retrieves the historical list of all completed transactions.
   */
  async getTransactionHistory(): Promise<TransferResponse[]> {
    const response = await apiClient.get<TransferResponse[]>('/transfers');
    return response.data;
  },

  /**
   * Retrieves receipt details of a single transaction by reference code.
   */
  async getTransactionByReference(reference: string): Promise<TransferResponse> {
    const response = await apiClient.get<TransferResponse>(`/transfers/${encodeURIComponent(reference)}`);
    return response.data;
  },

  /**
   * Returns the direct URL to the transaction QR Code PNG image.
   */
  getQrCodeImageUrl(transactionId: number): string {
    return `${BASE_URL}/transfers/${transactionId}/qr`;
  }
};
