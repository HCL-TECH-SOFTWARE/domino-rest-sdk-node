# ========================================================================== #
# Copyright (C) 2023 HCL America Inc.                                        #
# Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           #
# ========================================================================== #
mkdir -p .testcerts
cd .testcerts
ssh-keygen -t rsa -b 4096 -m PEM -f private.key
openssl rsa -in private.key -pubout -outform PEM -out public.key.pub
cd ..
