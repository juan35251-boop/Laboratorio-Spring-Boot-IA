import React, { useState } from 'react';
import { TransferResponse } from '../../types/bank';
import {
  CheckCircle2,
  Download,
  Printer,
  X,
  QrCode,
  Copy,
  ExternalLink,
  FileText,
  Layers,
  Code2,
  FileJson,
  ShieldCheck,
  Landmark,
  ArrowRight
} from 'lucide-react';
import './ReceiptModal.css';

interface ReceiptModalProps {
  receipt: TransferResponse | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ receipt, onClose }) => {
  const [activeTab, setActiveTab] = useState<'structured' | 'raw' | 'json'>('structured');
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  if (!receipt) return null;

  const voucherUrl =
    receipt.voucherUrl ||
    `http://localhost:8080/api/transfers/${receipt.transactionReference}/voucher`;

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(receipt.transactionReference);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(receipt.qrCodeData);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const jsonPayload = JSON.stringify(
    {
      bank: receipt.bankName || 'Banco TdeA',
      transactionReference: receipt.transactionReference,
      timestamp: receipt.timestamp,
      amount: receipt.amount,
      currency: 'COP',
      status: receipt.status,
      sourceAccount: {
        number: receipt.sourceAccountNumber,
        holder: receipt.sourceAccountHolder,
      },
      destinationAccount: {
        number: receipt.destinationAccountNumber,
        holder: receipt.destinationAccountHolder,
      },
      description: receipt.description || 'Traslado de fondos entre cuentas',
      voucherVerificationUrl: voucherUrl,
    },
    null,
    2
  );

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonPayload);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenPdfVoucher = () => {
    window.open(voucherUrl, '_blank');
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = receipt.qrCodeBase64;
    link.download = `QR_${receipt.transactionReference}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="receipt-backdrop" onClick={onClose}>
      <div className="receipt-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="receipt-close-btn" onClick={onClose} aria-label="Cerrar comprobante">
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="receipt-header">
          <div className="success-badge-ring">
            <CheckCircle2 size={36} className="success-check-icon" />
          </div>
          <span className="receipt-tagline">Comprobante Oficial de Traslado</span>
          <h2 className="receipt-title">¡Operación Exitosa!</h2>
          <div className="ref-badge-row">
            <span className="ref-label">Referencia:</span>
            <span className="ref-code">{receipt.transactionReference}</span>
            <button className="ref-copy-btn" onClick={handleCopyRef} title="Copiar referencia">
              <Copy size={13} />
              {copiedRef && <span className="copied-bubble">¡Copiado!</span>}
            </button>
          </div>
        </div>

        {/* Amount Highlight */}
        <div className="receipt-amount-card">
          <span className="amount-caption">Valor Trasladado</span>
          <span className="amount-number">{formatCOP(receipt.amount)}</span>
          <div className="amount-badges">
            <span className="badge-status-approved">
              <ShieldCheck size={13} />
              TRANSACCIÓN APROBADA
            </span>
            <span className="badge-bank-name">
              <Landmark size={13} />
              {receipt.bankName || 'Banco TdeA'}
            </span>
          </div>
        </div>

        {/* Transfer Visual Route */}
        <div className="transfer-route-box">
          <div className="route-node">
            <span className="route-node-label">Origen</span>
            <span className="route-node-holder">{receipt.sourceAccountHolder}</span>
            <span className="route-node-acc">{receipt.sourceAccountNumber}</span>
          </div>
          <div className="route-arrow">
            <ArrowRight size={20} />
          </div>
          <div className="route-node">
            <span className="route-node-label">Destino</span>
            <span className="route-node-holder">{receipt.destinationAccountHolder}</span>
            <span className="route-node-acc">{receipt.destinationAccountNumber}</span>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="receipt-qr-section">
          <div className="qr-badge-title">
            <QrCode size={18} />
            <span>Código QR Oficial de la Transacción</span>
          </div>
          <p className="qr-hint">
            Este código QR contiene <strong>los datos básicos de la transacción codificados</strong>{' '}
            conforme a los requerimientos del taller y el enlace de validación bancaria.
          </p>

          <div className="qr-image-wrapper">
            <img
              src={receipt.qrCodeBase64}
              alt={`QR Code para ${receipt.transactionReference}`}
              className="qr-image"
            />
          </div>

          <div className="qr-actions-row">
            <button
              type="button"
              className="qr-tool-btn primary-action"
              onClick={handleOpenPdfVoucher}
            >
              <ExternalLink size={14} />
              <span>Abrir Comprobante Digital (PDF)</span>
            </button>
            <button type="button" className="qr-tool-btn" onClick={handleDownloadQr}>
              <Download size={14} />
              <span>Descargar Imagen QR (PNG)</span>
            </button>
          </div>
        </div>

        {/* Encoded Transaction Data Inspector (Teacher Requirement) */}
        <div className="encoded-inspector">
          <div className="inspector-header">
            <div className="inspector-title">
              <Layers size={16} />
              <span>Datos Básicos Codificados de la Transacción</span>
            </div>
            <div className="inspector-tabs">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'structured' ? 'active' : ''}`}
                onClick={() => setActiveTab('structured')}
              >
                <Layers size={13} />
                <span>Campos</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'raw' ? 'active' : ''}`}
                onClick={() => setActiveTab('raw')}
              >
                <Code2 size={13} />
                <span>Texto QR</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}
                onClick={() => setActiveTab('json')}
              >
                <FileJson size={13} />
                <span>JSON</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Structured Fields */}
          {activeTab === 'structured' && (
            <div className="structured-grid">
              <div className="field-item">
                <span className="field-label">Referencia</span>
                <span className="field-value mono">{receipt.transactionReference}</span>
              </div>
              <div className="field-item">
                <span className="field-label">Fecha y Hora</span>
                <span className="field-value">
                  {new Date(receipt.timestamp).toLocaleString('es-CO')}
                </span>
              </div>
              <div className="field-item">
                <span className="field-label">Entidad Bancaria</span>
                <span className="field-value">{receipt.bankName || 'Banco TdeA'}</span>
              </div>
              <div className="field-item">
                <span className="field-label">Valor Trasladado</span>
                <span className="field-value text-emerald">{formatCOP(receipt.amount)}</span>
              </div>
              <div className="field-item">
                <span className="field-label">Cuenta y Titular Origen</span>
                <span className="field-value">
                  {receipt.sourceAccountNumber} — {receipt.sourceAccountHolder}
                </span>
              </div>
              <div className="field-item">
                <span className="field-label">Cuenta y Titular Destino</span>
                <span className="field-value">
                  {receipt.destinationAccountNumber} — {receipt.destinationAccountHolder}
                </span>
              </div>
              <div className="field-item full-width">
                <span className="field-label">Concepto / Motivo</span>
                <span className="field-value">
                  {receipt.description || 'Traslado entre cuentas'}
                </span>
              </div>
              <div className="field-item">
                <span className="field-label">Estado</span>
                <span className="field-value status-approved-text">
                  {receipt.status} (APROBADA)
                </span>
              </div>
              <div className="field-item">
                <span className="field-label">Comprobante Digital</span>
                <a
                  href={voucherUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="field-link"
                >
                  Ver PDF en línea →
                </a>
              </div>
            </div>
          )}

          {/* Tab 2: Raw Text Encoded in QR */}
          {activeTab === 'raw' && (
            <div className="code-viewer-wrap">
              <div className="viewer-toolbar">
                <span className="toolbar-caption">Payload de texto codificado en el QR:</span>
                <button type="button" className="copy-code-btn" onClick={handleCopyPayload}>
                  <Copy size={13} />
                  <span>{copiedPayload ? '¡Copiado!' : 'Copiar Texto'}</span>
                </button>
              </div>
              <pre className="code-block">{receipt.qrCodeData}</pre>
            </div>
          )}

          {/* Tab 3: Structured JSON */}
          {activeTab === 'json' && (
            <div className="code-viewer-wrap">
              <div className="viewer-toolbar">
                <span className="toolbar-caption">Estructura JSON (Open Banking):</span>
                <button type="button" className="copy-code-btn" onClick={handleCopyJson}>
                  <Copy size={13} />
                  <span>{copiedJson ? '¡Copiado!' : 'Copiar JSON'}</span>
                </button>
              </div>
              <pre className="code-block json">{jsonPayload}</pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="receipt-footer">
          <button type="button" className="receipt-btn pdf-btn" onClick={handleOpenPdfVoucher}>
            <FileText size={16} />
            <span>Descargar Comprobante PDF</span>
          </button>
          <button type="button" className="receipt-btn secondary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Imprimir</span>
          </button>
          <button type="button" className="receipt-btn primary" onClick={onClose}>
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
};
