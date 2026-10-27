import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import {
  TrendingUp,
  ShieldCheck,
  QrCode,
  CircleDollarSign
} from 'lucide-react';
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
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Executive Dashboard Metrics
  const metrics = useMemo(() => {
    const totalCustody = accounts.reduce((sum, a) => sum + a.balance, 0);
    const totalVolume = transactions.reduce((sum, t) => sum + (t.status === 'SUCCESS' ? t.amount : 0), 0);
    return {
      totalCustody,
      totalVolume,
      txCount: transactions.length,
      accountsCount: accounts.length,
    };
  }, [accounts, transactions]);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleExecuteTransfer = async (payload: TransferRequest) => {
    setLoading(true);
    try {
      const response = await TransferService.createTransfer(payload);

      // Refresh accounts and transaction history
      await loadData();

      // Launch celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }

      addToast(
        'success',
        '¡Transferencia Exitosa!',
        `Se trasladaron ${formatCOP(payload.amount)} con código QR codificado generado.`
      );

      // Display the receipt modal with QR Code and encoded data
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
        {/* Executive Metrics Dashboard Banner */}
        <section className="executive-banner">
          <div className="metric-box">
            <div className="metric-icon-wrap emerald">
              <CircleDollarSign size={20} />
            </div>
            <div className="metric-text-wrap">
              <span className="metric-title">Saldo en Custodia</span>
              <span className="metric-value">{formatCOP(metrics.totalCustody)}</span>
              <span className="metric-sub">{metrics.accountsCount} Cuentas bancarias activas</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-wrap blue">
              <TrendingUp size={20} />
            </div>
            <div className="metric-text-wrap">
              <span className="metric-title">Volumen Total Trasladado</span>
              <span className="metric-value">{formatCOP(metrics.totalVolume)}</span>
              <span className="metric-sub">Fondos movilizados en el sistema</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-wrap indigo">
              <QrCode size={20} />
            </div>
            <div className="metric-text-wrap">
              <span className="metric-title">Comprobantes & QR</span>
              <span className="metric-value">{metrics.txCount} Operaciones</span>
              <span className="metric-sub">Datos codificados en servidor</span>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-wrap purple">
              <ShieldCheck size={20} />
            </div>
            <div className="metric-text-wrap">
              <span className="metric-title">Seguridad Bancaria</span>
              <span className="metric-value text-emerald">100% Auditado</span>
              <span className="metric-sub">Base de datos H2 persistente</span>
            </div>
          </div>
        </section>

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

      {/* Official Voucher / Receipt Modal with QR Code and Encoded Data */}
      <ReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />
    </div>
  );
};
