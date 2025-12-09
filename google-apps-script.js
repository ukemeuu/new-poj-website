/**
 * Google Apps Script for Pot of Jollof Kitchen Booking System
 * This script receives booking data from the website and submits it to Google Forms
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Form with the following fields:
 *    - Date (Date)
 *    - Number of Guests (Short answer)
 *    - Arrival Time (Short answer)
 *    - Full Name (Short answer)
 *    - Phone Number (Short answer)
 *    - Email Address (Short answer)
 *    - Special Requests (Paragraph)
 * 
 * 2. Get the Form ID from the URL:
 *    https://docs.google.com/forms/d/FORM_ID_HERE/edit
 * 
 * 3. Replace FORM_ID below with your actual Form ID
 * 
 * 4. Deploy this script as a web app:
 *    - Click "Deploy" > "New deployment"
 *    - Select type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 *    - Click "Deploy"
 *    - Copy the web app URL
 * 
 * 5. Update the GOOGLE_APPS_SCRIPT_URL in booking.js with your web app URL
 */

// CONFIGURATION
const FORM_ID = '1WGo00C7DmMm_dgIhHYKrQ_mbp3O_s37fIisWD6PQ1qs';

// Main function to handle POST requests
function doPost(e) {
    try {
        // Parse the incoming data
        const data = JSON.parse(e.postData.contents);

        // Validate data
        if (!data.date || !data.guests || !data.time || !data.name || !data.phone || !data.email) {
            return ContentService.createTextOutput(JSON.stringify({
                'status': 'error',
                'message': 'Missing required fields'
            })).setMimeType(ContentService.MimeType.JSON);
        }

        // Submit to Google Form
        submitToGoogleForm(data);

        // Send confirmation email (optional)
        sendConfirmationEmail(data);

        // Return success response
        return ContentService.createTextOutput(JSON.stringify({
            'status': 'success',
            'message': 'Reservation received successfully'
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        Logger.log('Error: ' + error.toString());
        return ContentService.createTextOutput(JSON.stringify({
            'status': 'error',
            'message': error.toString()
        })).setMimeType(ContentService.MimeType.JSON);
    }
}

// Submit data to Google Form
function submitToGoogleForm(data) {
    try {
        const form = FormApp.openById(FORM_ID);
        const formResponse = form.createResponse();
        const items = form.getItems();

        // Map data to form fields
        // Note: Adjust the indices based on your form's question order
        items.forEach((item, index) => {
            const itemResponse = item.asTextItem();

            switch (index) {
                case 0: // Date
                    formResponse.withItemResponse(itemResponse.createResponse(data.date));
                    break;
                case 1: // Number of Guests
                    formResponse.withItemResponse(itemResponse.createResponse(data.guests.toString()));
                    break;
                case 2: // Arrival Time
                    formResponse.withItemResponse(itemResponse.createResponse(data.time));
                    break;
                case 3: // Full Name
                    formResponse.withItemResponse(itemResponse.createResponse(data.name));
                    break;
                case 4: // Phone Number
                    formResponse.withItemResponse(itemResponse.createResponse(data.phone));
                    break;
                case 5: // Email Address
                    formResponse.withItemResponse(itemResponse.createResponse(data.email));
                    break;
                case 6: // Special Requests
                    if (data.notes) {
                        formResponse.withItemResponse(item.asParagraphTextItem().createResponse(data.notes));
                    }
                    break;
            }
        });

        formResponse.submit();
        Logger.log('Form submitted successfully');

    } catch (error) {
        Logger.log('Error submitting to form: ' + error.toString());
        throw error;
    }
}

// Send confirmation email to customer
function sendConfirmationEmail(data) {
    try {
        const subject = 'Reservation Confirmation - Pot of Jollof Kitchen';
        const body = `
Dear ${data.name},

Thank you for your reservation request at Pot of Jollof Kitchen!

RESERVATION DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date: ${data.date}
Time: ${data.time}
Number of Guests: ${data.guests}
Name: ${data.name}
Phone: ${data.phone}
Email: ${data.email}
${data.notes ? 'Special Requests: ' + data.notes : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Our team will contact you shortly to confirm your reservation.

If you have any questions, please don't hesitate to reach out:
📞 Phone: 0795-384-140
📧 Email: customerservice@potofjollof.co.ke
📍 Location: Hurlingham, Nairobi

We look forward to serving you!

Best regards,
Pot of Jollof Kitchen Team
    `;

        MailApp.sendEmail(data.email, subject, body);
        Logger.log('Confirmation email sent to: ' + data.email);

    } catch (error) {
        Logger.log('Error sending email: ' + error.toString());
        // Don't throw error - email is optional
    }
}

// Send notification email to restaurant
function sendNotificationToRestaurant(data) {
    const restaurantEmail = 'customerservice@potofjollof.co.ke';
    const subject = 'New Reservation Request';
    const body = `
New reservation request received:

Date: ${data.date}
Time: ${data.time}
Guests: ${data.guests}
Name: ${data.name}
Phone: ${data.phone}
Email: ${data.email}
Special Requests: ${data.notes || 'None'}

Please contact the customer to confirm.
  `;

    try {
        MailApp.sendEmail(restaurantEmail, subject, body);
        Logger.log('Notification sent to restaurant');
    } catch (error) {
        Logger.log('Error sending notification: ' + error.toString());
    }
}

// Test function
function testSubmission() {
    const testData = {
        date: '2025-12-15',
        guests: '4',
        time: '7:00 PM',
        name: 'John Doe',
        phone: '+254 700 000 000',
        email: 'john@example.com',
        notes: 'Window seat preferred'
    };

    submitToGoogleForm(testData);
    sendConfirmationEmail(testData);
    Logger.log('Test completed');
}
