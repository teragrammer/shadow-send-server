Introduction
======================
This open-source tool enables secure, peer-to-peer sharing of texts and files with end-to-end encryption. 

Designed for privacy and simplicity, it ensures your data is shared directly between users without intermediaries, 
keeping your communications confidential and tamper-proof. 

Perfect for anyone who values security and control over their information.

How to run/use this backend server
=======================
This server should work with docker

- Clone the repository
```
$ git clone https://github.com/teragrammer/shadow-send-server.git
$ cd shadow-send-server
```

- Generate your own SSL cert (optional)
```
$ sh bin/generate-ssl.sh
```

- Configure your .env (.env.example)

- Initialize Docker
```
$ docker compose up -d
$ sh bin/start-container.sh
```

- Install dependencies
```
$ npm install
```

- Start the server
```
$ node index.js
```