package com.udea.banktransfer.service;

import com.udea.banktransfer.dto.TransferResponseDTO;
import org.springframework.stereotype.Service;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Enumeration;
import java.util.Locale;

/**
 * Service generating official digital voucher HTML documents formatted as bank PDF receipts
 * and resolving network verification URLs for QR codes.
 */
@Service
public class VoucherViewService {

    /**
     * Resolves the primary local network IPv4 address accessible from mobile devices on the same Wi-Fi.
     *
     * @return IPv4 address string (e.g. 192.168.1.3) or fallback to localhost
     */
    public String getLocalNetworkIp() {
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface iface = interfaces.nextElement();
                if (iface.isLoopback() || !iface.isUp()) continue;
                Enumeration<InetAddress> addresses = iface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress addr = addresses.nextElement();
                    if (addr instanceof Inet4Address && !addr.isLoopbackAddress()) {
                        String ip = addr.getHostAddress();
                        if (!ip.startsWith("192.168.56.") && !ip.startsWith("169.254.")) {
                            return ip;
                        }
                    }
                }
            }
            return InetAddress.getLocalHost().getHostAddress();
        } catch (Exception e) {
            return "localhost";
        }
    }

    /**
     * Constructs the full public voucher URL for a given transaction reference.
     *
     * @param reference unique transaction reference code
     * @return absolute URL string
     */
    public String getVoucherUrl(String reference) {
        String host = getLocalNetworkIp();
        return "http://" + host + ":8080/api/transfers/" + reference + "/voucher";
    }

    /**
     * Generates a self-contained, responsive, print-optimized HTML voucher styled like an official bank PDF receipt.
     *
     * @param tx the transaction details DTO
     * @return complete HTML5 document string
     */
    public String generateVoucherHtml(TransferResponseDTO tx) {
        NumberFormat currencyFormat = NumberFormat.getCurrencyInstance(new Locale("es", "CO"));
        String formattedAmount = currencyFormat.format(tx.amount());

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd/MM/yyyy, hh:mm:ss a", new Locale("es", "CO"));
        String formattedDate = tx.timestamp() != null ? tx.timestamp().format(dtf) : "Reciente";

        String description = (tx.description() != null && !tx.description().isBlank())
                ? tx.description()
                : "Traslado de fondos entre cuentas";

        String bankName = (tx.bankName() != null && !tx.bankName().isBlank())
                ? tx.bankName()
                : "Banco TdeA";

        return """
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comprobante de Transferencia - %s</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #059669;
      --primary-dark: #047857;
      --slate-900: #0f172a;
      --slate-700: #334155;
      --slate-500: #64748b;
      --slate-100: #f1f5f9;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: #f8fafc;
      color: var(--slate-900);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px 40px 16px;
    }
    .action-bar {
      max-width: 540px;
      width: 100%;
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }
    .btn {
      flex: 1;
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 0.92rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: none;
      transition: all 0.2s ease;
      text-decoration: none;
    }
    .btn-primary {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
    }
    .btn-primary:hover {
      background: linear-gradient(135deg, #047857 0%, #065f46 100%);
    }
    .btn-secondary {
      background: #ffffff;
      color: var(--slate-700);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover {
      background: var(--slate-100);
    }
    .voucher-card {
      max-width: 540px;
      width: 100%;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 20px;
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
      padding: 32px 28px;
      position: relative;
      overflow: hidden;
    }
    .voucher-card::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #059669, #10b981, #3b82f6);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border);
      padding-bottom: 18px;
      margin-bottom: 22px;
    }
    .brand-box {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
    }
    .brand-name {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--slate-900);
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 0.76rem;
      color: var(--slate-500);
      font-weight: 500;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #ecfdf5;
      color: #065f46;
      border: 1px solid #a7f3d0;
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 0.78rem;
      font-weight: 700;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
    }
    .doc-title {
      text-align: center;
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--slate-900);
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .doc-subtitle {
      text-align: center;
      font-size: 0.82rem;
      color: var(--slate-500);
      margin-bottom: 24px;
    }
    .amount-card {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border-radius: 16px;
      padding: 22px 20px;
      text-align: center;
      color: #ffffff;
      margin-bottom: 24px;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15);
    }
    .amount-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      font-weight: 600;
      margin-bottom: 4px;
      display: block;
    }
    .amount-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 2.1rem;
      font-weight: 800;
      color: #34d399;
      display: block;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .details-table tr {
      border-bottom: 1px solid #f1f5f9;
    }
    .details-table td {
      padding: 12px 4px;
      font-size: 0.88rem;
    }
    .label-col {
      color: var(--slate-500);
      font-weight: 600;
      width: 40%%;
    }
    .val-col {
      color: var(--slate-900);
      font-weight: 700;
      text-align: right;
    }
    .mono {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.82rem;
    }
    .holder-sub {
      display: block;
      font-size: 0.76rem;
      color: var(--slate-500);
      font-weight: 500;
      font-family: 'JetBrains Mono', monospace;
    }
    .qr-proof-box {
      background: #f8fafc;
      border: 1px dashed #cbd5e1;
      border-radius: 14px;
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    .qr-thumb {
      width: 90px;
      height: 90px;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 4px;
      flex-shrink: 0;
    }
    .qr-thumb img {
      width: 100%%;
      height: 100%%;
      display: block;
    }
    .qr-proof-text {
      flex: 1;
    }
    .qr-proof-title {
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--slate-900);
      margin-bottom: 2px;
    }
    .qr-proof-desc {
      font-size: 0.76rem;
      color: var(--slate-500);
      line-height: 1.35;
    }
    .security-footer {
      border-top: 1px solid var(--border);
      padding-top: 14px;
      text-align: center;
      font-size: 0.74rem;
      color: #94a3b8;
      line-height: 1.4;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .voucher-card {
        box-shadow: none;
        border: 1px solid #cbd5e1;
        max-width: 100%%;
        width: 100%%;
        border-radius: 0;
        padding: 24px;
      }
      @page {
        margin: 1.5cm;
        size: auto;
      }
    }
  </style>
</head>
<body>

  <div class="action-bar no-print">
    <button class="btn btn-primary" onclick="window.print()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      Descargar en PDF / Imprimir
    </button>
    <a href="http://%s:3000" class="btn btn-secondary">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
      Ir a la Banca Web
    </a>
  </div>

  <div class="voucher-card">
    <div class="header">
      <div class="brand-box">
        <div class="brand-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"/></svg>
        </div>
        <div>
          <h1 class="brand-name">%s</h1>
          <p class="brand-sub">Tecnológico de Antioquia — Red Bancaria</p>
        </div>
      </div>
      <div class="status-badge">
        <span class="status-dot"></span>
        <span>TRANSACCIÓN APROBADA</span>
      </div>
    </div>

    <h2 class="doc-title">Comprobante de Transferencia</h2>
    <p class="doc-subtitle">Certificado Oficial de Movimiento Electrónico de Fondos</p>

    <div class="amount-card">
      <span class="amount-label">Valor Trasladado</span>
      <span class="amount-value">%s</span>
    </div>

    <table class="details-table">
      <tr>
        <td class="label-col">Referencia de Operación</td>
        <td class="val-col mono">%s</td>
      </tr>
      <tr>
        <td class="label-col">Fecha y Hora</td>
        <td class="val-col">%s</td>
      </tr>
      <tr>
        <td class="label-col">Entidad Bancaria</td>
        <td class="val-col">%s</td>
      </tr>
      <tr>
        <td class="label-col">Cuenta de Origen</td>
        <td class="val-col">
          <span>%s</span>
          <span class="holder-sub">%s</span>
        </td>
      </tr>
      <tr>
        <td class="label-col">Cuenta de Destino</td>
        <td class="val-col">
          <span>%s</span>
          <span class="holder-sub">%s</span>
        </td>
      </tr>
      <tr>
        <td class="label-col">Concepto / Motivo</td>
        <td class="val-col">%s</td>
      </tr>
      <tr>
        <td class="label-col">Estado del Traslado</td>
        <td class="val-col" style="color: #059669;">%s (Completado)</td>
      </tr>
      <tr>
        <td class="label-col">Canal de Operación</td>
        <td class="val-col">Banca Virtual Web / Antigravity API</td>
      </tr>
    </table>

    <div class="qr-proof-box">
      <div class="qr-thumb">
        <img src="%s" alt="Código QR de Verificación">
      </div>
      <div class="qr-proof-text">
        <h4 class="qr-proof-title">Sello Digital de Validación</h4>
        <p class="qr-proof-desc">Este comprobante electrónico cuenta con certificación digital de no repudio conforme a los estándares bancarios del sistema.</p>
      </div>
    </div>

    <div class="security-footer">
      <p>Tecnológico de Antioquia — Institución Universitaria • Vigilada MinEducación</p>
      <p>Documento electrónico generado válidamente. Para dudas comuníquese a soporte bancario.</p>
    </div>
  </div>

</body>
</html>
""".formatted(
                tx.transactionReference(),
                getLocalNetworkIp(),
                bankName,
                formattedAmount,
                tx.transactionReference(),
                formattedDate,
                bankName,
                tx.sourceAccountHolder(),
                tx.sourceAccountNumber(),
                tx.destinationAccountHolder(),
                tx.destinationAccountNumber(),
                description,
                tx.status(),
                tx.qrCodeBase64()
        );
    }
}
