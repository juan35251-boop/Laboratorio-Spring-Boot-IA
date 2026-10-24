import React, { useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar/Navbar';
import { AccountCards } from './components/AccountCards/AccountCards';
import { TransferForm } from './components/TransferForm/TransferForm';
import { TransactionHistory } from './components/TransactionHistory/TransactionHistory';
import { ReceiptModal } from './components/ReceiptModal/ReceiptModal';
import { Toast, ToastMessage } from './components/Toast/Toast';
import { TransferService } from './services/transferService';
import { Account, TransferRequest, TransferResponse } from './types/bank';
import axios from 'axios';
import './App.css';

export const App: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<TransferResponse[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [activeReceipt, setActiveReceipt] = useState<TransferResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = useCallback(async () => {
    try {
      const [accs, txs] = await Promise.all([
        TransferService.getAccounts(),
        TransferService.getTransactionHistory(),
      ]);
      setAccounts(accs);
      setTransactions(txs);
      setBackendOnline(true);

      // Pre-select first two accounts if not selected
      if (!selectedSource && accs.length > 0) {
        setSelectedSource(accs[0].accountNumber);
      }
      if (!selectedDestination && accs.length > 1) {
        setSelectedDestination(accs[1].accountNumber);
      }
    } catch (err) {
      console.error('Failed to communicate with backend:', err);
      setBackendOnline(false);
    }
  }, [selectedSource, selectedDestination]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000); // Polling every 15s to keep sync
    return () => clearInterval(interval);
  }, [loadData]);

  const handleExecuteTransfer = async (payload: TransferRequest) => {
    setLoading(true);
    try {
      const response = await TransferService.createTransfer(payload);

      // Refresh accounts and transaction history
      await loadData();

      // Launch celebration confetti
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore if canvas not supported
      }

      addToast(
        'success',
        '¡Transferencia Exitosa!',
        `Se trasladaron $${payload.amount.toLocaleString('es-CO')} COP a la cuenta ${payload.destinationAccountNumber}.`
      );

      // Display the receipt modal with QR Code
      setActiveReceipt(response);
    } catch (err: unknown) {
      let errorMsg = 'No fue posible completar la transferencia.';
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        } else if (err.message) {
          errorMsg = err.message;
        }
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      addToast('error', 'Error en Transferencia', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyNumber = (accNumber: string) => {
    navigator.clipboard.writeText(accNumber);
    addToast('info', 'Copiado', `Número ${accNumber} copiado al portapapeles.`);
  };

  return (
    <div className="bank-app">
      <Navbar backendOnline={backendOnline} />
      <Toast toasts={toasts} onDismiss={removeToast} />

      <main className="main-content">
        {/* Account Balance Cards */}
        <AccountCards
          accounts={accounts}
          selectedSource={selectedSource}
          selectedDestination={selectedDestination}
          onSelectSource={setSelectedSource}
          onSelectDestination={setSelectedDestination}
          onCopyNumber={handleCopyNumber}
        />

        {/* Action Grid: Transfer Form & Transaction History */}
        <div className="action-grid">
          <div className="form-column">
            <TransferForm
              accounts={accounts}
              sourceAccountNumber={selectedSource}
              destinationAccountNumber={selectedDestination}
              onSourceChange={setSelectedSource}
              onDestinationChange={setSelectedDestination}
              onSubmitTransfer={handleExecuteTransfer}
              loading={loading}
            />
          </div>

          <div className="history-column">
            <TransactionHistory
              transactions={transactions}
              onSelectTransaction={(t) => setActiveReceipt(t)}
              onRefresh={loadData}
              loading={loading}
            />
          </div>
        </div>
      </main>

      {/* Official Voucher / Receipt Modal with QR Code */}
      <ReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />
    </div>
  );
};
