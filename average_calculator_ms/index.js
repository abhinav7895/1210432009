const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

const windowSize = 10;
let storedNumbers = [];

const apiUrls = {
    'p': 'http://20.244.56.144/test/primes',
    'f': 'http://20.244.56.144/test/fibo',
    'e': 'http://20.244.56.144/test/even',
    'r': 'http://20.244.56.144/test/rand'
};


const fetchToken = async () => {
    const tokenUrl = 'http://20.244.56.144/test/auth';
    const authData = {
        companyName: 'goMart',
        clientID: 'e25c1565-504d-475b-8724-72cc780b9967',
        clientSecret: 'vDfyEZVHhlbOulKt',
        ownerName: 'Abhinav Yadav',
        ownerEmail: 'abhinavay2003@bbdu.ac.in',
        rollNo: '1210432009'
    };

    try {
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(authData)
        });

        if (!response.ok) {
            throw new Error('Failed to fetch token');
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error fetching token:', error);
        throw error;
    }
};



app.get('/numbers/:numberid', async (req, res) => {
    const { numberid } = req.params;
    const url = apiUrls[numberid];

    if (!url) {
        return res.status(400).json({ error: 'Invalid numberid' });
    }

    try {
        const token = await fetchToken();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 500); 

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // const response = await fetch(url, {
        //     signal: controller.signal,
        //     headers: {
        //         'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzI0MTYzNzcxLCJpYXQiOjE3MjQxNjM0NzEsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImUyNWMxNTY1LTUwNGQtNDc1Yi04NzI0LTcyY2M3ODBiOTk2NyIsInN1YiI6ImFiaGluYXZheTIwMDNAYmJkdS5hYy5pbiJ9LCJjb21wYW55TmFtZSI6ImdvTWFydCIsImNsaWVudElEIjoiZTI1YzE1NjUtNTA0ZC00NzViLTg3MjQtNzJjYzc4MGI5OTY3IiwiY2xpZW50U2VjcmV0IjoidkRmeUVaVkhobGJPdWxLdCIsIm93bmVyTmFtZSI6IkFiaGluYXYgWWFkYXYiLCJvd25lckVtYWlsIjoiYWJoaW5hdmF5MjAwM0BiYmR1LmFjLmluIiwicm9sbE5vIjoiMTIxMDQzMjAwOSJ9.TogRE8YhlaUpyrwAbUm7hfvICEyWtELd4BKINTbuN3A`
        //     }
        // });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        const newNumbers = data.numbers;

        const windowPrevState = [...storedNumbers];

        newNumbers.forEach(num => {
            if (!storedNumbers.includes(num)) {
                if (storedNumbers.length >= windowSize) {
                    storedNumbers.shift();
                }
                storedNumbers.push(num);
            }
        });

        const windowCurrState = [...storedNumbers];
        const avg = storedNumbers.reduce((a, b) => a + b, 0) / storedNumbers.length;

        res.json({
            windowPrevState,
            windowCurrState,
            numbers: newNumbers,
            avg: parseFloat(avg.toFixed(2))
        });

    } catch (error) {
        console.log(error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
