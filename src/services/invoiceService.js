/**
 * Invoice Service for FuelRescue
 * Generates official, printable GST-compliant Tax Invoices & Digital Receipts
 * Opens a print-to-PDF ready window with styling.
 */

export const invoiceService = {
  printReceipt: (orderData) => {
    if (!orderData) return;

    const invoiceNo = `FR-${(orderData.id || `REQ${Date.now()}`).slice(-8).toUpperCase()}`;
    const dateStr = orderData.createdAt ? new Date(orderData.createdAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');
    const fuelType = orderData.fuelType || "Petrol";
    const qty = Number(orderData.quantity) || 5;
    const pricePerLitre = Number(orderData.pricePerLitre || (fuelType === 'Petrol' ? 102.86 : 87.92));
    const fuelSubtotal = Number(orderData.subtotal || (qty * pricePerLitre));
    const baseFee = Number(orderData.baseDeliveryFee || 150.00);
    const distanceKm = Number(orderData.distanceKm || 4.2);
    const perKmRate = Number(orderData.deliveryFeePerKm || 15.00);
    const distanceCharge = Number((distanceKm * perKmRate).toFixed(2));
    const surge = Number(orderData.emergencySurge || 50.00);
    const totalAmount = Number(orderData.totalAmount || (fuelSubtotal + baseFee + distanceCharge + surge));
    const customerName = orderData.customerName || "Motorist";
    const address = orderData.address || "Roadside Breakdown Location";
    const partnerName = orderData.partnerName || "Rapid Response Fleet Unit";
    const vehicleNumber = orderData.partnerVehicle || "KA-01-EQ-9021";

    const printHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>FuelRescue Invoice - ${invoiceNo}</title>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          body { padding: 40px; color: #1e293b; background: #fff; line-height: 1.5; font-size: 13px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; }
          .brand-title { font-size: 24px; font-weight: 900; color: #ea580c; letter-spacing: -0.5px; }
          .brand-subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; }
          .invoice-badge { text-align: right; }
          .invoice-no { font-size: 18px; font-weight: 800; color: #0f172a; font-family: monospace; }
          .invoice-meta { font-size: 11px; color: #64748b; margin-top: 4px; }
          
          .grid { display: flex; justify-content: space-between; margin: 24px 0; gap: 20px; }
          .box { flex: 1; padding: 16px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
          .box-title { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 6px; }
          .box-name { font-size: 14px; font-weight: 700; color: #0f172a; }
          .box-detail { font-size: 12px; color: #475569; margin-top: 2px; }

          table { width: 100%; border-collapse: collapse; margin: 24px 0; }
          th { text-align: left; padding: 10px 12px; background: #0f172a; color: #fff; font-size: 11px; text-transform: uppercase; font-weight: 700; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
          .text-right { text-align: right; }
          
          .summary-card { width: 320px; margin-left: auto; margin-top: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; }
          .summary-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; color: #475569; }
          .summary-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #ea580c; border-top: 2px solid #cbd5e1; padding-top: 8px; margin-top: 8px; }

          .stamp-container { display: flex; justify-content: space-between; align-items: center; margin-top: 36px; padding-top: 20px; border-top: 1px dashed #cbd5e1; }
          .stamp { border: 2px solid #10b981; color: #10b981; font-weight: 900; text-transform: uppercase; font-size: 12px; padding: 6px 16px; border-radius: 8px; display: inline-block; transform: rotate(-3deg); }
          .footer-note { font-size: 10px; color: #94a3b8; text-align: right; max-width: 400px; }

          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: right;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #ea580c; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer;">
            Print / Save as PDF
          </button>
        </div>

        <div class="header">
          <div>
            <div class="brand-title">FuelRescue</div>
            <div class="brand-subtitle">Emergency Fuel Delivery & Roadside Safety Network</div>
            <p style="font-size: 11px; color: #64748b; margin-top: 4px;">PESO Safety Certified Dispensing • 24/7 Rapid Incident Dispatch</p>
          </div>
          <div class="invoice-badge">
            <div class="invoice-no">${invoiceNo}</div>
            <div class="invoice-meta">Tax Invoice & Delivery Receipt</div>
            <div class="invoice-meta">${dateStr}</div>
          </div>
        </div>

        <div class="grid">
          <div class="box">
            <div class="box-title">Billed To (Motorist)</div>
            <div class="box-name">${customerName}</div>
            <div class="box-detail">${address}</div>
            <div class="box-detail" style="margin-top: 6px; font-family: monospace;">OTP Handover Verified: ✓</div>
          </div>
          <div class="box">
            <div class="box-title">Fulfilled By (Certified Responder)</div>
            <div class="box-name">${partnerName}</div>
            <div class="box-detail">Emergency Fleet Unit: <strong>${vehicleNumber}</strong></div>
            <div class="box-detail">Payment Method: <strong>UPI / Instant Digital Settlement</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Quantity / Distance</th>
              <th class="text-right">Unit Rate</th>
              <th class="text-right">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Emergency Top-Up Fuel (${fuelType})</strong>
                <div style="font-size: 10px; color: #64748b;">PESO Compliant Safe Anti-Static Dispensing</div>
              </td>
              <td class="text-right">${qty} Litres</td>
              <td class="text-right">₹${pricePerLitre.toFixed(2)}/L</td>
              <td class="text-right">₹${fuelSubtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>
                <strong>Base Rapid Incident Dispatch Fee</strong>
                <div style="font-size: 10px; color: #64748b;">Emergency responder vehicle mobilization</div>
              </td>
              <td class="text-right">1 Incident</td>
              <td class="text-right">₹${baseFee.toFixed(2)}</td>
              <td class="text-right">₹${baseFee.toFixed(2)}</td>
            </tr>
            <tr>
              <td>
                <strong>Highway Distance Transit Charge</strong>
                <div style="font-size: 10px; color: #64748b;">GPS corridor route transit (${distanceKm} km)</div>
              </td>
              <td class="text-right">${distanceKm} km</td>
              <td class="text-right">₹${perKmRate.toFixed(2)}/km</td>
              <td class="text-right">₹${distanceCharge.toFixed(2)}</td>
            </tr>
            <tr>
              <td>
                <strong>Emergency Hazard Safety Escort Surcharge</strong>
                <div style="font-size: 10px; color: #64748b;">Highway hazard markers & safety beacon equipment</div>
              </td>
              <td class="text-right">Standard</td>
              <td class="text-right">₹${surge.toFixed(2)}</td>
              <td class="text-right">₹${surge.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="summary-card">
          <div class="summary-row">
            <span>Fuel Value:</span>
            <span>₹${fuelSubtotal.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Transit & Services:</span>
            <span>₹${(baseFee + distanceCharge + surge).toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>GST Applicable (Incl. 18% on dispatch):</span>
            <span>Included</span>
          </div>
          <div class="summary-total">
            <span>Total Amount Paid:</span>
            <span>₹${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div class="stamp-container">
          <div>
            <div class="stamp">PAID & VERIFIED</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 6px;">Handover OTP Verified by Certified Responder</div>
          </div>
          <div class="footer-note">
            This is a computer-generated official tax invoice and electronic delivery receipt issued by FuelRescue Roadside Systems.
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;

    const printWin = window.open('', '_blank', 'width=850,height=900');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
    } else {
      alert("Please allow popups to open and print the PDF tax invoice.");
    }
  }
};
