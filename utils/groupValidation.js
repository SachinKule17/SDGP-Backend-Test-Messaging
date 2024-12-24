const { supabase } = require('../services/supabase');

async function isUserInGroup(user_id, grp_id) {
    const { data, error } = await supabase
        .from('Group_Table')
        .select('*')
        .eq('grp_id', grp_id)
        .eq('user_id', user_id);

    if (error) {
        console.error('Error validating group membership:', error);
        throw new Error('Error validating group membership');
    }

    return data.length > 0;
}

module.exports = { isUserInGroup };
