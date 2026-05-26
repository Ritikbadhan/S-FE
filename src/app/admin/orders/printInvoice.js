const getInvoiceHTML = (order, currency) => {
  const shipping = order.shippingAddress || {};

  const invoiceDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-GB")
    : "-";

  const subtotal = Number(order.subtotalAmount || 0);

  const gstRate = subtotal <= 1000 ? 5 : 12;

  const taxableAmount = subtotal / (1 + gstRate / 100);

  const gstAmount = subtotal - taxableAmount;

  const paymentType =
    order.paymentMethod === "RAZORPAY"
      ? "ONLINE"
      : "COD";

  return `
    <html>

      <head>

        <title>Invoice</title>

        <style>

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          @page {
            margin: 0;
            size: A4;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            background: #fff;
            font-family: Arial, sans-serif;
            color: #222;
          }

          body {

            /* HIDE HEADER & FOOTER */
            margin: 0 !important;
          }

          .invoice-page {
            width: 794px;
            min-height: 1123px;
            margin: auto;
            padding: 18px 22px;
            background: #fff;
          }

          .header {
            text-align: center;
            margin-bottom: 18px;
          }

          .brand {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: 0.4px;
          }

          .invoice-title {
            font-size: 22px;
            font-weight: 700;
            padding: 10px 0;
            border-top: 1px solid #d8d8d8;
            border-bottom: 1px solid #d8d8d8;
          }

          .top-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-bottom: 14px;
          }

          .card {
            border: 1px solid #e6e6e6;
            border-radius: 6px;
            padding: 12px;
          }

          .card-title {
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 10px;
            text-transform: uppercase;
            border-bottom: 1px solid #efefef;
            padding-bottom: 6px;
            color: #111;
          }

          .text {
            font-size: 13px;
            line-height: 1.55;
            color: #333;
          }

          .invoice-details {
            display: grid;
            grid-template-columns: 110px 1fr;
            gap: 8px;
            font-size: 13px;
          }

          .invoice-details .label {
            font-weight: 700;
            color: #111;
          }

          .seller-card {
            margin-bottom: 14px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          thead {
            background: #fafafa;
            border-top: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
          }

          th {
            padding: 10px 8px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            color: #555;
          }

          td {
            padding: 12px 8px;
            font-size: 13px;
            border-bottom: 1px solid #f1f1f1;
            vertical-align: top;
          }

          .center {
            text-align: center;
          }

          .right {
            text-align: right;
          }

          .product-name {
            font-weight: 700;
            margin-bottom: 3px;
            color: #111;
          }

          .product-meta {
            font-size: 12px;
            color: #666;
          }

          .summary-wrapper {
            display: flex;
            justify-content: flex-end;
            margin-top: 16px;
          }

          .summary-box {
            width: 320px;
            border: 1px solid #e5e5e5;
            border-radius: 6px;
            overflow: hidden;
          }

          .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 14px;
            font-size: 13px;
            border-bottom: 1px solid #f1f1f1;
          }

          .summary-row:last-child {
            border-bottom: none;
          }

          .total-row {
            font-size: 18px;
            font-weight: 700;
            background: #fafafa;
          }

          @media print {

            html,
            body {
              width: 210mm;
              height: 297mm;
              overflow: hidden;
            }

            .invoice-page {
              width: 100%;
              min-height: auto;
              padding: 16px 18px;
            }

          }

        </style>

      </head>

      <body>

        <div class="invoice-page">

          <!-- HEADER -->
          <div class="header">

            <div class="brand">
              Sharq Label
            </div>

            <div class="invoice-title">
              TAX INVOICE
            </div>

          </div>

          <!-- TOP -->
          <div class="top-grid">

            <!-- SHIPPING -->
            <div class="card">

              <div class="card-title">
                Shipping Address
              </div>

              <div class="text">

                <strong>
                  ${shipping.name || "-"}
                </strong><br/>

                ${shipping.line1 || ""}<br/>

                ${
                  shipping.line2
                    ? `${shipping.line2}<br/>`
                    : ""
                }

                ${shipping.city || ""}, 
                ${shipping.state || ""} - 
                ${shipping.pincode || ""}<br/>

                India<br/><br/>

                <strong>Phone:</strong>
                ${shipping.phone || "-"}

              </div>

            </div>

            <!-- INVOICE DETAILS -->
            <div class="card">

              <div class="card-title">
                Invoice Details
              </div>

              <div class="invoice-details">

                <div class="label">
                  Invoice No.
                </div>

                <div>
                  INV-${order._id?.slice(-6)}
                </div>

                <div class="label">
                  Invoice Date
                </div>

                <div>
                  ${invoiceDate}
                </div>

                <div class="label">
                  Order ID
                </div>

                <div>
                  ${order._id || "-"}
                </div>

                <div class="label">
                  Payment
                </div>

                <div>
                  ${paymentType}
                </div>

                <div class="label">
                  GST Rate
                </div>

                <div>
                  ${gstRate}% GST
                </div>

                <div class="label">
                  Status
                </div>

                <div>
                  ${order.orderStatus || "-"}
                </div>

              </div>

            </div>

          </div>

          <!-- SELLER -->
          <div class="card seller-card">

            <div class="card-title">
              Sold By
            </div>

            <div class="text">

              <strong>
                Sharq Label
              </strong><br/>

              D-102 Ace Platinum Zeta 1,
              Greater Noida,
              Gautam Buddha Nagar,
              Uttar Pradesh - 201310,
              India<br/><br/>

              <strong>GSTIN:</strong>
              09EHBPR0090D1ZH<br/>

              <strong>Email:</strong>
              info@sharqlabel.com

            </div>

          </div>

          <!-- PRODUCTS -->
          <table>

            <thead>

              <tr>

                <th width="50">
                  #
                </th>

                <th>
                  Product
                </th>

                <th width="70" class="center">
                  Qty
                </th>

                <th width="110" class="right">
                  Price
                </th>

                <th width="80" class="right">
                  GST
                </th>

                <th width="120" class="right">
                  Total
                </th>

              </tr>

            </thead>

            <tbody>

              ${(order.items || [])
                .map((item, index) => {
                  const qty =
                    item.quantity || item.qty || 1;

                  const price = item.price || 0;

                  const total = qty * price;

                  return `
                    <tr>

                      <td>
                        ${index + 1}
                      </td>

                      <td>

                        <div class="product-name">
                          ${item.name || item.productName || "-"}
                        </div>

                        <div class="product-meta">
                          Size: ${item.size || "-"} |
                          Color: ${item.color || "-"}
                        </div>

                      </td>

                      <td class="center">
                        ${qty}
                      </td>

                      <td class="right">
                        ${currency(price)}
                      </td>

                      <td class="right">
                        ${gstRate}%
                      </td>

                      <td class="right">
                        ${currency(total)}
                      </td>

                    </tr>
                  `;
                })
                .join("")}

            </tbody>

          </table>

          <!-- SUMMARY -->
          <div class="summary-wrapper">

            <div class="summary-box">

              <div class="summary-row">
                <span>
                  Taxable Amount
                </span>

                <span>
                  ${currency(taxableAmount)}
                </span>
              </div>

              <div class="summary-row">
                <span>
                  GST (${gstRate}%)
                </span>

                <span>
                  ${currency(gstAmount)}
                </span>
              </div>

              <div class="summary-row total-row">
                <span>
                  NET TOTAL
                </span>

                <span>
                  ${currency(order.totalAmount || 0)}
                </span>
              </div>

            </div>

          </div>

        </div>

      </body>

    </html>
  `;
};

export const printInvoice = (order, currency) => {
  const popup = window.open(
    "",
    "_blank",
    "toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1000,height=900"
  );

  if (!popup || !order) return;

  popup.document.open();

  popup.document.write(
    getInvoiceHTML(order, currency)
  );

  popup.document.close();

  popup.focus();

  setTimeout(() => {
    popup.print();

    popup.onafterprint = () => {
      popup.close();
    };
  }, 400);
};