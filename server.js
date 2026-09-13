const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Luhn Algorithm Validation
function checkLuhn(cardNumber) {
    let sum = 0;
    let shouldDouble = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        shouldDouble = !shouldDouble;
    }
    return (sum % 10 === 0);
}

// CC Generator Function
function generateCC(bin, length = 16) {
    let result = bin;
    while (result.length < length - 1) {
        result += Math.floor(Math.random() * 10);
    }
    for (let i = 0; i <= 9; i++) {
        if (checkLuhn(result + i)) {
            result += i;
            break;
        }
    }
    return result;
}

// API Route
app.post('/api/generate', (req, res) => {
    const { bin, quantity = 10 } = req.body;
    
    // Clean BIN input
    const cleanBin = bin.replace(/[^0-9xX]/g, '');
    if (!cleanBin || cleanBin.length < 6) {
        return res.status(400).json({ error: 'INVALID BIN FORMAT' });
    }

    const cards = [];
    const limit = Math.min(parseInt(quantity) || 10, 100);

    for (let i = 0; i < limit; i++) {
        // Handle BINs with 'x' or 'X'
        let currentBin = '';
        for (let char of cleanBin.slice(0, 12)) {
            if (char.toLowerCase() === 'x') {
                currentBin += Math.floor(Math.random() * 10);
            } else {
                currentBin += char;
            }
        }

        const number = generateCC(currentBin);
        const mm = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        const yy = Math.floor(Math.random() * 5) + 2026;
        const cvv = Math.floor(Math.random() * 899) + 100;
        cards.push(`${number}|${mm}|${yy}|${cvv}`);
    }

    res.json({ success: true, count: cards.length, cards });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`[SK TERMINAL] Server running on port ${PORT}`));
