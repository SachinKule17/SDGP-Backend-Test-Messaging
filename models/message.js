// const { supabase } = require('../services/supabase');

// async function insertMessage(sender_id, receiver_id, content) {
//     const { data, error } = await supabase
//         .from('message_table')
//         .insert([{ sender_id, receiver_id, content, status: 'delivered' }]);

//     if (error) {
//         console.error('Supabase insert error details:', {
//             message: error.message,
//             hint: error.hint,
//             details: error.details,
//             code: error.code,
//         });
//         throw new Error(`Supabase insert error: ${error.message}`);
//     }
//     return data[0];
// }

// module.exports = { insertMessage };

const { supabase } = require('../services/supabase');
const { encrypt } = require('../utils/encryption'); // Import the encryption utility

async function insertMessage(sender_id, receiver_id, content) {
    try {
        // Encrypt the message content
        const encryptedContent = encrypt(content);

        // Insert the encrypted message into the database
        const { data, error } = await supabase
            .from('message_table')
            .insert([{ sender_id, receiver_id, content: encryptedContent, status: 'delivered' }]);

        if (error) {
            console.error('Supabase insert error details:', {
                message: error.message,
                hint: error.hint,
                details: error.details,
                code: error.code,
            });
            throw new Error(`Supabase insert error: ${error.message}`);
        }

        return data[0];
    } catch (error) {
        console.error('Error in insertMessage:', error.message || error);
        throw error;
    }
}

async function updateMessageStatus(sender_id, receiver_id, status) {
    const { data, error } = await supabase
        .from('message_table')
        .update({ status })
        .eq('sender_id', sender_id)
        .eq('receiver_id', receiver_id);

    if (error) {
        console.error('Supabase update error details:', {
            message: error.message,
            hint: error.hint,
            details: error.details,
            code: error.code,
        });
        throw new Error(`Supabase update error: ${error.message}`);
    }

    return data;
}

module.exports = { insertMessage, updateMessageStatus };
