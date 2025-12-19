const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');

router.post('/authentication', async (req, res) => {
    try {
        const { accountAddress } = req.query;
        const { signature } = req.body;

        console.log("=== Incoming Authentication Request ===");
        console.log("Account Address:", accountAddress);
        console.log("Signature:", signature);

        if (!signature || !accountAddress) {
            console.log("Missing signature or accountAddress");
            return res.status(400).json({ message: "Authentication Failed" });
        }

        const message = "Register cyberCrime Reports. You accept our terms and conditions";
        const recoveredAddress = ethers.utils.verifyMessage(message, signature);

        console.log("Recovered Address:", recoveredAddress);

        if (recoveredAddress.toLowerCase() === accountAddress.toLowerCase()) {
            const token = jwt.sign({ accountAddress }, 'secretKey', { expiresIn: '1h' });
            console.log("Authentication successful, JWT token generated");
            return res.status(200).json({ message: "Authentication Successful", token });
        } else {
            console.log("Recovered address does not match account");
            return res.status(401).json({ message: "Authentication failed" });
        }
    } catch (error) {
        console.error("Error during authentication:", error);
        res.status(500).json({ message: "Authentication failed", error: error.message });
    }
});

module.exports = router;
