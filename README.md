# pgpexample

## Git configuration
```bash
git config user.name "Your Name"
git config user.email "your-email@example.com"

```

## Testing
In the RestClientTests folder you will find tests.http file. It contains working tests to test key creation, encryption and decryption.

Use 
```bash
func start
```
To start the Azure functions locally

# **Understanding PGP (Pretty Good Privacy)**

## **🔍 What is PGP?**
**PGP (Pretty Good Privacy)** is a data encryption and decryption system used to secure sensitive information, such as emails, files, and digital communications. It ensures **confidentiality, integrity, and authenticity** through **public-key cryptography**.

---

## **🔑 How PGP Works**
PGP uses a combination of:
1. **Asymmetric Encryption (Public & Private Keys)** – Used for securing messages.
2. **Symmetric Encryption (Session Keys)** – Used for efficiency.
3. **Digital Signatures** – Used for authentication.

### **📌 PGP Encryption Process**
1. The **sender** retrieves the recipient's **public key**.
2. The sender encrypts the message using **a randomly generated session key**.
3. The session key is then encrypted using the **recipient's public key**.
4. The encrypted session key + the encrypted message are sent to the recipient.

### **🔓 PGP Decryption Process**
1. The **recipient** uses their **private key** to decrypt the session key.
2. The decrypted session key is used to **decrypt the actual message**.
3. The recipient can now read the original message.

---

## **🛠 Key Concepts**
### **🔑 Public & Private Keys**
- **Public Key** – Shared openly and used for encryption.
- **Private Key** – Kept secret and used for decryption.

### **📝 Digital Signatures**
- PGP allows **signing messages** using a private key to **verify authenticity**.
- The recipient can verify the sender’s identity using their **public key**.

---

## **📌 Example of a PGP Message**
**🔑 Public Key Block**
```
-----BEGIN PGP PUBLIC KEY BLOCK-----
...
-----END PGP PUBLIC KEY BLOCK-----
```

**🔒 Encrypted Message**
```
-----BEGIN PGP MESSAGE-----
...
-----END PGP MESSAGE-----
```

**🔓 Decrypted Message**
```
Hello, this is a secure message!
```

---

## **🚀 Why Use PGP?**
✅ **End-to-End Encryption** – Protects messages from eavesdropping.  
✅ **Digital Signatures** – Ensures messages are not tampered with.  
✅ **Open Standard** – Used in emails, file encryption, and software verification.

---

## **🔗 Further Reading**
- [GNU Privacy Guard (GPG) - Open Source PGP](https://gnupg.org/)
- [PGP Explained - Wikipedia](https://en.wikipedia.org/wiki/Pretty_Good_Privacy)

---

PGP remains one of the most **trusted** encryption standards for securing digital communication.

