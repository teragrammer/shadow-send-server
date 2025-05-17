openssl genpkey -algorithm RSA -out certs/server-key.pem
openssl req -new -key certs/server-key.pem -out certs/server.csr
openssl x509 -req -days 365 -in certs/server.csr -signkey certs/server-key.pem -out certs/server-cert.pem
openssl genpkey -algorithm RSA -out certs/ca-key.pem
openssl req -new -x509 -key certs/ca-key.pem -out certs/ca-cert.pem