const { app } = require('@azure/functions');
const openpgp = require('openpgp');

/**
 * Function 1: Generate a New PGP Key Pair (Plain Text)
 */
app.http('generatePGPKeys', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            // Generate a new PGP key pair
            const { privateKey, publicKey } = await openpgp.generateKey({
                type: 'rsa',
                rsaBits: 2048,
                userIDs: [{ name: "Azure Function", email: "azure@function.com" }]
            });

            // Format response as plain text
            const responseText = `START PUBLIC KEY\n${publicKey}\nSTART PRIVATE KEY\n${privateKey}`;

            return {
                status: 200,
                body: responseText,
                headers: { "Content-Type": "text/plain" }
            };

        } catch (error) {
            context.log(`Error: ${error.message}`);
            return {
                status: 500,
                body: `Error: ${error.message}`,
                headers: { "Content-Type": "text/plain" }
            };
        }
    }
});

/**
 * Function 2: Encrypt Data with PGP Public Key (Everything in Body)
 */
app.http('pgpexample', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            // Read full body content (contains both public key and data)
            const bodyContent = await request.text();

            // Extract public key and data
            const publicKeyMatch = bodyContent.match(/START PUBLIC KEY\n([\s\S]+?)\nSTART DATA/);
            const dataMatch = bodyContent.match(/START DATA\n([\s\S]+)/);

            if (!publicKeyMatch || !dataMatch) {
                return { status: 400, body: "Invalid format. Expected START PUBLIC KEY and START DATA sections." };
            }

            const publicKey = publicKeyMatch[1].trim();
            const dataToEncrypt = dataMatch[1].trim();

            // Log the request
            context.log(`Encrypting data with provided public key.`);

            // Read public key
            const pubKey = await openpgp.readKey({ armoredKey: publicKey });

            // Encrypt the data
            const encryptedMessage = await openpgp.encrypt({
                message: await openpgp.createMessage({ text: dataToEncrypt }),
                encryptionKeys: pubKey
            });

            // Format response as plain text
            const responseText = `START ENCRYPTED MESSAGE\n${encryptedMessage}`;

            return {
                status: 200,
                body: responseText,
                headers: { "Content-Type": "text/plain" }
            };

        } catch (error) {
            context.log(`Error: ${error.message}`);
            return {
                status: 500,
                body: `Error: ${error.message}`,
                headers: { "Content-Type": "text/plain" }
            };
        }
    }
});

/**
 * Function 3: Decrypt a PGP-Encrypted Message (Everything in Body)
 */
app.http('decryptPGP', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            // Read full body content (contains both private key and encrypted message)
            const bodyContent = await request.text();

            // Extract private key and encrypted message
            const privateKeyMatch = bodyContent.match(/START PRIVATE KEY\n([\s\S]+?)\nSTART ENCRYPTED MESSAGE/);
            const encryptedMessageMatch = bodyContent.match(/START ENCRYPTED MESSAGE\n([\s\S]+)/);

            if (!privateKeyMatch || !encryptedMessageMatch) {
                return { status: 400, body: "Invalid format. Expected START PRIVATE KEY and START ENCRYPTED MESSAGE sections." };
            }

            const privateKey = privateKeyMatch[1].trim();
            const encryptedMessage = encryptedMessageMatch[1].trim();

            // Log the request
            context.log("Decrypting received PGP message.");

            // Read private key
            const privKey = await openpgp.readPrivateKey({ armoredKey: privateKey });

            // Read encrypted message
            const message = await openpgp.readMessage({ armoredMessage: encryptedMessage });

            // Decrypt the message
            const { data: decryptedMessage } = await openpgp.decrypt({
                message,
                decryptionKeys: privKey
            });

            // Format response as plain text
            // const responseText = `START DECRYPTED MESSAGE\n${decryptedMessage}`;
            const responseText = decryptedMessage;

            return {
                status: 200,
                body: responseText,
                headers: { "Content-Type": "text/plain" }
            };

        } catch (error) {
            context.log(`Error: ${error.message}`);
            return {
                status: 500,
                body: `Error: ${error.message}`,
                headers: { "Content-Type": "text/plain" }
            };
        }
    }
});
