const { supabase } = require('../services/supabase');
const { encrypt } = require('../utils/encryption');
const { isUserInGroup } = require('../utils/groupValidation');

async function insertGroupMessage(sender_id, grp_id, content) {
    try {
        // Validate user in the group
        const isMember = await isUserInGroup(sender_id, grp_id);
        if (!isMember) {
            throw new Error('User is not a member of this group');
        }

        // Encrypt the message
        const encryptedContent = encrypt(content);

        // Insert the group message
        const { data, error } = await supabase
            .from('Group_message_table')
            .insert([{ grp_id, sender_id, content: encryptedContent }]);

        if (error) {
            console.error('Error inserting group message:', error);
            throw new Error(`Supabase insert error: ${error.message}`);
        }

        return data[0];
    } catch (error) {
        console.error('Error in insertGroupMessage:', error.message);
        throw error;
    }
}

module.exports = { insertGroupMessage };