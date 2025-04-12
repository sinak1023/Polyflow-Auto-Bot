require('dotenv').config();
const axios = require('axios');
const { createCanvas } = require('canvas');
const { HttpsProxyAgent } = require('https-proxy-agent');
const chalk = require('chalk');
const readlineSync = require('readline-sync');
const fs = require('fs').promises;
const path = require('path');

const API_BASE_URL = 'https://api-v2.polyflow.tech/api/scan2earn';

const readTokens = async () => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'token.txt'), 'utf8');
    const tokens = data.split('\n').map(line => line.trim()).filter(line => line);
    if (!tokens.length) throw new Error('No tokens found in token.txt');
    const validTokens = tokens.filter(token => {
      if (!token.startsWith('Bearer ')) {
        console.error(chalk.red(`❌ Invalid token format (missing Bearer): ${token.slice(0, 20)}...`));
        return false;
      }
      return true;
    });
    if (!validTokens.length) throw new Error('No valid tokens found in token.txt');
    return validTokens;
  } catch (error) {
    console.error(chalk.red(`❌ Error reading token.txt: ${error.message}`));
    process.exit(1);
  }
};

const readProxies = async () => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'proxies.txt'), 'utf8');
    const proxies = data.split('\n').map(line => line.trim()).filter(line => line);
    return proxies.length ? proxies : null;
  } catch (error) {
    console.error(chalk.red(`❌ Error reading proxies.txt: ${error.message}`));
    return null;
  }
};

const getRandomProxy = (proxies) => {
  if (!proxies || !proxies.length) return null;
  return proxies[Math.floor(Math.random() * proxies.length)];
};

const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomFloat = (min, max, decimals = 2) => {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
};

const getRandomDate = () => {
  const now = new Date();
  const daysAgo = getRandomInt(0, 30);
  const randomDate = new Date(now);
  randomDate.setDate(now.getDate() - daysAgo);
  return randomDate.toLocaleDateString();
};

const getRandomName = () => {
  const firstNames = ['John', 'Jane', 'Mike', 'Emma', 'David', 'Sarah', 'Robert', 'Linda', 'William', 'Emily', 
                      'James', 'Olivia', 'Alex', 'Sophia', 'Daniel', 'Mia', 'Thomas', 'Ava', 'Joseph', 'Isabella'];
  const lastNames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Miller', 'Wilson', 'Moore', 'Jackson', 'Martin', 'Lee',
                     'Davis', 'White', 'Harris', 'Clark', 'Lewis', 'Young', 'Walker', 'Hall', 'Allen', 'Wright'];
  
  return `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
};

const getRandomAddress = () => {
  const streets = ['Main St', 'Oak Ave', 'Maple Rd', 'Cedar Ln', 'Pine Dr', 'Elm St', 'Washington Ave', 
                  'Park Rd', 'Lake Dr', 'River Rd', 'Forest Ave', 'Broadway', 'Highland Ave', 'Sunset Blvd'];
  const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 
                 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Boston', 'Seattle'];
  const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'MI', 'GA', 'NC', 'WA', 'MA'];
  const zipCodes = Array.from({ length: 5 }, () => getRandomInt(0, 9)).join('');
  
  return `${getRandomInt(1, 9999)} ${getRandomItem(streets)}, ${getRandomItem(cities)}, ${getRandomItem(states)} ${zipCodes}`;
};

const getRandomProducts = (count = getRandomInt(1, 5)) => {
  const productNames = [
    'Desktop Computer', 'Laptop', 'Monitor', 'Keyboard', 'Mouse', 'Headphones', 'Speakers', 'Printer',
    'Tablet', 'Smartphone', 'Camera', 'USB Drive', 'External Hard Drive', 'Router', 'Smart Watch',
    'Software License', 'Office Chair', 'Desk', 'Filing Cabinet', 'Paper Shredder', 'Projector',
    'Scanner', 'Server', 'Network Switch', 'UPS Battery Backup', 'Toner Cartridge', 'Phone System',
    'Webcam', 'Microphone', 'Graphics Card', 'RAM Module', 'CPU', 'Power Supply'
  ];
  
  const products = [];
  const usedProducts = new Set();
  
  for (let i = 0; i < count; i++) {
    let productName;
    do {
      productName = getRandomItem(productNames);
    } while (usedProducts.has(productName));
    
    usedProducts.add(productName);
    
    products.push({
      desc: productName,
      qty: getRandomInt(1, 10),
      price: getRandomFloat(10, 1000)
    });
  }
  
  return products;
};

const generateFileName = () => {
  const randomString = Math.random().toString(36).substring(2, 12);
  const timestamp = Date.now();
  return `invoice-${timestamp}-${randomString}.png`;
};

const generateInvoice = () => {
  const canvas = createCanvas(600, 800);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000000';

  ctx.font = 'bold 30px Arial';
  const companyNames = ['TechSupply Inc.', 'Global Systems', 'Infinity Tech', 'Digital Solutions', 'Smart Services'];
  const companyName = getRandomItem(companyNames);
  ctx.fillText(companyName, 50, 50);

  ctx.font = '12px Arial';
  ctx.fillText(`Phone: ${getRandomInt(100, 999)}-${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`, 50, 70);
  ctx.fillText(`Email: info@${companyName.toLowerCase().replace(/\s+/g, '')}.com`, 50, 85);

  ctx.font = 'bold 24px Arial';
  ctx.fillText('INVOICE', 450, 50);

  const invoiceId = `INV-${getRandomInt(10000, 99999)}`;
  const invoiceDate = getRandomDate();
  ctx.font = '16px Arial';
  ctx.fillText(`Invoice #: ${invoiceId}`, 400, 80);
  ctx.fillText(`Date: ${invoiceDate}`, 400, 100);

  const customerName = getRandomName();
  const customerAddress = getRandomAddress();
  
  ctx.font = 'bold 18px Arial';
  ctx.fillText('BILL TO:', 50, 130);
  ctx.font = '16px Arial';
  ctx.fillText(customerName, 50, 155);

  const addressParts = customerAddress.split(', ');
  ctx.fillText(addressParts[0], 50, 175);
  ctx.fillText(addressParts.slice(1).join(', '), 50, 195);

  ctx.font = 'bold 18px Arial';
  ctx.fillText('PAYMENT DETAILS:', 400, 130);
  ctx.font = '16px Arial';
  
  const paymentMethods = ['Credit Card', 'Bank Transfer', 'PayPal', 'Check', 'Cash'];
  ctx.fillText(`Method: ${getRandomItem(paymentMethods)}`, 400, 155);
  ctx.fillText(`Due Date: ${getRandomDate()}`, 400, 175);

  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(50, 230, 500, 30);
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Description', 60, 250);
  ctx.fillText('Qty', 280, 250);
  ctx.fillText('Price', 340, 250);
  ctx.fillText('Total', 480, 250);

  ctx.font = '14px Arial';
  const items = getRandomProducts();
  let y = 280;
  let grandTotal = 0;
  
  items.forEach((item) => {
    const total = item.qty * item.price;
    grandTotal += total;
    ctx.fillText(item.desc, 60, y);
    ctx.fillText(item.qty.toString(), 280, y);
    ctx.fillText(`$${item.price.toFixed(2)}`, 340, y);
    ctx.fillText(`$${total.toFixed(2)}`, 480, y);
    y += 30;
  });

  const taxRate = getRandomFloat(0, 0.1);
  const tax = grandTotal * taxRate;
  
  y += 20;
  ctx.fillRect(340, y - 10, 210, 1); 
  
  ctx.fillText('Subtotal:', 400, y + 10);
  ctx.fillText(`$${grandTotal.toFixed(2)}`, 480, y + 10);
  
  ctx.fillText(`Tax (${(taxRate * 100).toFixed(1)}%):`, 400, y + 40);
  ctx.fillText(`$${tax.toFixed(2)}`, 480, y + 40);
  
  ctx.font = 'bold 16px Arial';
  ctx.fillText('TOTAL:', 400, y + 70);
  ctx.fillText(`$${(grandTotal + tax).toFixed(2)}`, 480, y + 70);
  
  y += 100;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('Notes:', 50, y);
  ctx.font = '14px Arial';
  
  const notes = [
    'Payment due within 30 days.',
    'Please include invoice number on your payment.',
    'Thank you for your business!',
    'For questions, contact our accounting department.',
    'A late fee of 1.5% will be applied to overdue invoices.'
  ];
  
  notes.forEach((note, index) => {
    ctx.fillText(note, 50, y + 25 + (index * 20));
  });
  
  return canvas.toBuffer('image/png');
};

const getPresignedUrl = async (fileName, token, proxy) => {
  const headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.6',
    'authorization': token,
    'content-type': 'application/json',
    'sec-ch-ua': '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'sec-gpc': '1',
    'Referer': 'https://app.polyflow.tech/',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
  try {
    const response = await axios.get(`${API_BASE_URL}/get_presigned_url?file_name=${fileName}`, {
      headers,
      httpsAgent: proxy ? new HttpsProxyAgent(proxy) : undefined,
    });
    
    if (response.data?.msg?.presigned_url) {
      const urlStart = response.data.msg.presigned_url.substring(0, 30);
      console.log(chalk.white(`  📝 Got presigned URL: ${urlStart}... (key: ${response.data.msg.key})`));
    } else {
      console.log(chalk.white(`  📝 Got presigned URL response`));
    }
    
    if (!response.data?.msg?.presigned_url || !response.data?.msg?.key) {
      throw new Error('Invalid presigned URL response');
    }
    const url = response.data.msg.presigned_url;
    const key = response.data.msg.key;
    if (!url.startsWith('https://')) {
      throw new Error(`Invalid URL format: ${url}`);
    }
    return { url, key };
  } catch (error) {
    console.error(chalk.red(`  ❌ Error getting presigned URL: ${error.message}`));
    throw error;
  }
};

const uploadInvoice = async (presignedUrl, fileBuffer, proxy) => {
  try {
    new URL(presignedUrl);
    await axios.put(presignedUrl, fileBuffer, {
      headers: {
        'content-type': 'application/octet-stream',
      },
      httpsAgent: proxy ? new HttpsProxyAgent(proxy) : undefined,
    });
    console.log(chalk.green('  ✅ Invoice uploaded successfully'));
  } catch (error) {
    console.error(chalk.red(`  ❌ Error uploading invoice: ${error.message}`));
    throw error;
  }
};

const saveInvoice = async (invoicePath, token, proxy) => {
  const headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.6',
    'authorization': token,
    'content-type': 'application/json',
    'sec-ch-ua': '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site',
    'sec-gpc': '1',
    'Referer': 'https://app.polyflow.tech/',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
  try {
    const response = await axios.post(`${API_BASE_URL}/save_invoice`, {
      invoice_path: invoicePath,
    }, {
      headers,
      httpsAgent: proxy ? new HttpsProxyAgent(proxy) : undefined,
    });
    console.log(chalk.green('  ✅ Invoice saved successfully'));
  } catch (error) {
    console.error(chalk.red(`  ❌ Error saving invoice: ${error.message}`));
    throw error;
  }
};

const processInvoice = async (token, proxy, scanIndex, totalScans) => {
  console.log(chalk.cyan(`\n🔄 [${scanIndex}/${totalScans}] Starting scan...`));
  try {
    const fileName = generateFileName();
    console.log(chalk.white(`  📄 Generating unique invoice: ${fileName}`));
    const invoiceBuffer = generateInvoice();

    console.log(chalk.white('  🔑 Fetching presigned URL...'));
    const { url: presignedUrl, key } = await getPresignedUrl(fileName, token, proxy);

    console.log(chalk.white(`  📤 Uploading invoice to S3...`));
    await uploadInvoice(presignedUrl, invoiceBuffer, proxy);

    console.log(chalk.white('  💾 Saving invoice metadata...'));
    await saveInvoice(key, token, proxy);

    console.log(chalk.green(`✅ [${scanIndex}/${totalScans}] Scan completed successfully`));
    return true;
  } catch (error) {
    console.error(chalk.red(`❌ [${scanIndex}/${totalScans}] Failed to process invoice: ${error.message}`));
    return false;
  }
};

const main = async () => {
  console.clear();
  
  console.log(chalk.white('--------------------------------------------------------'));
  console.log(chalk.white('       AUTO SCANPOLYFLOW - AIRDROP INSIDERS  '));
  console.log(chalk.white('--------------------------------------------------------'));

  const tokens = await readTokens();
  console.log(chalk.green(`\n✅ Loaded ${tokens.length} tokens`));
  tokens.forEach((token, i) => {
    console.log(chalk.white(`  🔑 Token ${i + 1}: ${token.slice(0, 20)}...`));
  });

  const proxies = await readProxies();
  if (proxies) {
    console.log(chalk.green(`✅ Loaded ${proxies.length} proxies`));
  } else {
    console.log(chalk.yellow(`⚠️ No proxies loaded, running without proxy`));
  }

  console.log(chalk.yellow('\n⚙️ CONFIGURATION'));
  console.log(chalk.white('--------------------------------------------------------'));
  const scanCount = readlineSync.questionInt(chalk.white('📊 Enter the number of scans to perform: '), {
    min: 1,
  });
  console.log(chalk.green(`✅ Will perform ${scanCount} scan(s)`));

  console.log(chalk.yellow('\n🔄 PROCESSING SCANS'));
  console.log(chalk.white('--------------------------------------------------------'));
  
  let successfulScans = 0;
  const startTime = Date.now();
  
  for (let i = 1; i <= scanCount; i++) {
    const token = tokens[(i - 1) % tokens.length];
    const proxy = getRandomProxy(proxies);
    console.log(chalk.white(`  🔑 Using token: ${token.slice(0, 20)}...`));
    if (proxy) console.log(chalk.white(`  🌐 Using proxy: ${proxy}`));
    const success = await processInvoice(token, proxy, i, scanCount);
    if (success) successfulScans++;
    if (i < scanCount) {
      console.log(chalk.white('  ⏱️ Waiting 1 second before next scan...'));
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(chalk.yellow('\n🏁 SCAN SUMMARY'));
  console.log(chalk.white('--------------------------------------------------------'));
  console.log(chalk.green(`✅ Completed ${successfulScans}/${scanCount} scans successfully`));
  console.log(chalk.white(`⏱️ Total time: ${duration} seconds\n`));
  
  if (successfulScans < scanCount) {
    console.log(chalk.yellow('⚠️ Some scans failed. Check token validity or API status.'));
  }
};

main().catch(error => {
  console.error(chalk.red(`❌ FATAL ERROR: ${error.message}`));
  process.exit(1);
});