mkdir -p .testcerts
cd .testcerts
ssh-keygen -t rsa -b 4096 -m PEM -f private.key
openssl rsa -in private.key -pubout -outform PEM -out public.key.pub
cd ..
