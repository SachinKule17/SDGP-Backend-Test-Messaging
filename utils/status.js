function updateClientStatus(clients, userId, status) {
    const client = clients.get(userId);
    if (client) {
        client.send(JSON.stringify({ status }));
    }
}

module.exports = { updateClientStatus };
