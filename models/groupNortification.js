const { supabase } = require('../services/supabase');

async function notifyGroupMembers(clients, grp_id, message) {
    try {
        // Get group members
        const { data: members, error } = await supabase
            .from('Group_message_table')
            .select('user_id')
            .eq('grp_id', grp_id);

        if (error) {
            console.error('Error fetching group members:', error);
            throw new Error('Error fetching group members');
        }

        // Notify each member
        members.forEach((member) => {
            const client = clients.get(member.user_id);
            if (client) {
                client.send(JSON.stringify({ grp_id, message }));
            }
        });
    } catch (error) {
        console.error('Error in notifyGroupMembers:', error.message);
        throw error;
    }
}

module.exports = { notifyGroupMembers };
