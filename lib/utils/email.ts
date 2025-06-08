import { getSettings } from '@/lib/data';

interface EmailNotification {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmailNotification(notification: EmailNotification) {
  try {
    const settings = await getSettings();
    const emailSettings = settings.find(s => s.setting_key === 'email')?.value;

    if (!emailSettings) {
      console.error('No email settings found');
      return;
    }

    // TODO: Implement actual email sending logic here
    // For now, we'll just log the notification
    console.log('Sending email notification:', {
      to: emailSettings,
      ...notification
    });

    // Example implementation using a hypothetical email service:
    // await emailService.send({
    //   to: emailSettings,
    //   subject: notification.subject,
    //   text: notification.text,
    //   html: notification.html
    // });

  } catch (error) {
    console.error('Error sending email notification:', error);
  }
}

export function formatLowStockEmail(product: any) {
  return {
    subject: `Low Stock Alert: ${product.name}`,
    text: `The following product is running low on stock:\n\nProduct: ${product.name}\nCurrent Stock: ${product.stock}\nMinimum Stock: ${product.minStock}\n\nPlease take action to replenish the stock.`,
    html: `
      <h2>Low Stock Alert</h2>
      <p>The following product is running low on stock:</p>
      <ul>
        <li><strong>Product:</strong> ${product.name}</li>
        <li><strong>Current Stock:</strong> ${product.stock}</li>
        <li><strong>Minimum Stock:</strong> ${product.minStock}</li>
      </ul>
      <p>Please take action to replenish the stock.</p>
    `
  };
}

export function formatSalesReportEmail(report: any) {
  return {
    subject: `Daily Sales Report - ${new Date().toLocaleDateString()}`,
    text: `Daily Sales Report\n\nTotal Sales: ${report.totalSales}\nTotal Revenue: ${report.totalRevenue}\nTop Products:\n${report.topProducts.map((p: any) => `- ${p.name}: ${p.quantity} units`).join('\n')}`,
    html: `
      <h2>Daily Sales Report</h2>
      <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
      <h3>Summary</h3>
      <ul>
        <li><strong>Total Sales:</strong> ${report.totalSales}</li>
        <li><strong>Total Revenue:</strong> ${report.totalRevenue}</li>
      </ul>
      <h3>Top Products</h3>
      <ul>
        ${report.topProducts.map((p: any) => `
          <li>${p.name}: ${p.quantity} units</li>
        `).join('')}
      </ul>
    `
  };
} 