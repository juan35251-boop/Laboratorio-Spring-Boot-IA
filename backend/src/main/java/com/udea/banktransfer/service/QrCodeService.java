package com.udea.banktransfer.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Service dedicated to generating QR Code matrices and converting them to Base64 images and byte arrays.
 */
@Service
public class QrCodeService {

    private static final int DEFAULT_WIDTH = 300;
    private static final int DEFAULT_HEIGHT = 300;

    /**
     * Generates a PNG QR code image as a byte array from the given text payload.
     *
     * @param text the content payload to encode inside the QR code
     * @param width image width in pixels
     * @param height image height in pixels
     * @return byte array of the generated PNG QR image
     * @throws RuntimeException if QR generation fails
     */
    public byte[] generateQrCodeImageBytes(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.ERROR_CORRECTION, ErrorCorrectionLevel.H);
            hints.put(EncodeHintType.MARGIN, 1);

            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height, hints);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error occurred while generating QR Code: " + e.getMessage(), e);
        }
    }

    /**
     * Generates a Base64-encoded Data URL string of the QR code PNG image.
     *
     * @param text the content payload to encode
     * @return Base64 data URL string suitable for direct HTML rendering (e.g. data:image/png;base64,...)
     */
    public String generateQrCodeBase64(String text) {
        byte[] imageBytes = generateQrCodeImageBytes(text, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        return "data:image/png;base64," + Base64.getEncoder().encodeToString(imageBytes);
    }
}
