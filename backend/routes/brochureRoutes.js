const express = require('express');
const router = express.Router();
const BrochureRequest = require('../models/BrochureRequest');
const nodemailer = require('nodemailer');
const path = require('path');

// Create a new brochure request
router.post('/request', async (req, res) => {
    try {
        console.log('Received brochure request:', req.body);
        const { name, email, phone } = req.body;

        // Create new brochure request
        const brochureRequest = new BrochureRequest({
            name,
            email,
            phone,
            status: 'pending' // Default status
        });

        // Save to database
        const savedRequest = await brochureRequest.save();
        console.log('Saved brochure request:', savedRequest);

        // Send the brochure via email
        // Set up nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
            auth: {
                user: process.env.EMAIL_USER,    // your email address
                pass: process.env.EMAIL_PASS     // your email password or app password
            }
        });

        // Email options
        const mailOptions = {
            from: `Odaville <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Requested Brochure from Odaville',
            text: `Hi ${name},\n\nThank you for your interest in Odaville! Please find the brochure attached.\n\nBest regards,\nOdaville Team`,
            attachments: [
                {
                    filename: 'Odaville-Brochure.pdf',
                    path: path.join(__dirname, '../Odaville-Brochure.pdf')
                }
            ]
        };

        // Send the email
        try {
            await transporter.sendMail(mailOptions);
            // Optionally update status to 'sent' here if you want
            savedRequest.status = 'sent';
            await savedRequest.save();
        } catch (emailError) {
            console.error('Error sending brochure email:', emailError);
            savedRequest.status = 'failed';
            await savedRequest.save();
            return res.status(500).json({
                success: false,
                message: 'Brochure request saved, but failed to send email.',
                error: emailError.message
            });
        }

        // Send success response
        res.status(201).json({
            success: true,
            message: 'Brochure request received and brochure sent to email!',
            data: savedRequest
        });
    } catch (error) {
        console.error('Error in brochure request:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing brochure request',
            error: error.message
        });
    }
});

// Get all brochure requests (admin route)
router.get('/requests', async (req, res) => {
    try {
        const requests = await BrochureRequest.find()
            .sort({ createdAt: -1 }); // Sort by newest first

        res.status(200).json({
            success: true,
            data: requests
        });
    } catch (error) {
        console.error('Error fetching brochure requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching brochure requests',
            error: error.message
        });
    }
});

// Mark brochure request as sent
router.put('/request/:id/send', async (req, res) => {
    try {
        const request = await BrochureRequest.findByIdAndUpdate(
            req.params.id,
            { status: 'sent' },
            { new: true }
        );

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Brochure request not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Brochure request marked as sent',
            data: request
        });
    } catch (error) {
        console.error('Error updating brochure request:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating brochure request',
            error: error.message
        });
    }
});

// Delete brochure request
router.delete('/request/:id', async (req, res) => {
    try {
        const request = await BrochureRequest.findByIdAndDelete(req.params.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                message: 'Brochure request not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Brochure request deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting brochure request:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting brochure request',
            error: error.message
        });
    }
});

module.exports = router;