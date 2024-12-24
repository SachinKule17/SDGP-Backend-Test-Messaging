const http = require('http');
const WebSocket = require('ws');
const { encrypt, decrypt } = require('./utils/encryption');
const { supabase } = require('./services/supabase');
const { insertMessage, updateMessageStatus } = require('./models/message');
const { notifyGroupMembers } = require('./groupNotification');
const { insertGroupMessage } = require('./GroupValidation');
const { isUserInGroup } = require('./InsertGroupMassage');


// Create HTTP server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Map to store connected clients
const clients = new Map();

wss.on('connection', (ws, req) => {
    console.log('New client connected');

    ws.on('message', async (message) => {
        try {
            // Convert Buffer to string if necessary
            const messageString = message instanceof Buffer ? message.toString('utf8') : message;
    
            // Log the raw message for debugging
            console.log('Received raw message:', messageString);
    
            // Parse the message
            const parsedMessage = JSON.parse(messageString);
            const { sender_id, receiver_id, content, status } = parsedMessage;
    
            // Validate required fields
            if (!sender_id || !receiver_id || (!content && !status)) {
                throw new Error('Invalid message format. Missing required fields.');
            }
    
            if (content) {
                console.log(`Processing new message from ${sender_id} to ${receiver_id}`);
                
                // Encrypt the message content
                let encryptedContent;
                try {
                    encryptedContent = encrypt(content);
                } catch (encryptionError) {
                    throw new Error(`Encryption error: ${encryptionError.message}`);
                }
    
                // Insert the message into the database
                let response;
                try {
                    response = await insertMessage(sender_id, receiver_id, encryptedContent);
                    console.log('Message successfully inserted into database:', response);
                } catch (dbError) {
                    throw new Error(`Database insertion error: ${dbError.message}`);
                }
    
                // Notify sender of delivery status
                ws.send(JSON.stringify({ msg_id: response.id, status: 'delivered' }));
    
                // Forward the message to the receiver if connected
                const receiverSocket = clients.get(receiver_id);
                if (receiverSocket) {
                    receiverSocket.send(JSON.stringify({
                        sender_id,
                        content,
                        status: 'new',
                    }));
                    console.log(`Message delivered to receiver ${receiver_id}`);
                } else {
                    console.log(`Receiver ${receiver_id} is not connected`);
                }
            }
    
            if (status && status === 'read') {
                console.log(`Updating message status to 'read' for ${sender_id} -> ${receiver_id}`);
                try {
                    const updateResponse = await updateMessageStatus(sender_id, receiver_id, 'read');
                    console.log('Message status successfully updated:', updateResponse);
                } catch (dbUpdateError) {
                    throw new Error(`Database update error: ${dbUpdateError.message}`);
                }
            }
        } catch (error) {
            console.error('Error handling message:', error.message || error.stack || error);
        }
    });


    // Store clients with unique identifiers
    ws.on('grpmessage', async (message) => {
        try {
            const data = JSON.parse(message);

            switch (data.type) {
                case 'register':
                    // Add client to map
                    clients.set(data.user_id, ws);
                    break;

                case 'send_message':
                    // Insert the message into the database
                    const groupMessage = await insertGroupMessage(data.sender_id, data.grp_id, data.content);

                    // Notify group members
                    await notifyGroupMembers(clients, data.grp_id, groupMessage.content);
                    break;

                case 'check_group':
                    // Validate if user is in the group
                    const isMember = await isUserInGroup(data.user_id, data.grp_id);
                    ws.send(JSON.stringify({ type: 'group_check', isMember }));
                    break;

                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error processing message:', error.message);
            ws.send(JSON.stringify({ error: error.message }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        // Remove client from map
        for (let [userId, client] of clients) {
            if (client === ws) {
                clients.delete(userId);
                break;
            }
        }
    });
    

    // ws.on('close', () => {
    //     console.log('Client disconnected');
    // });
});

// Start the server
server.listen(8080, () => {
    console.log('Server listening on port 8080');
});
