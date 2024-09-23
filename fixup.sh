# ========================================================================== #
# Copyright (C) 2023, 2024 HCL America Inc.                                  #
# Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           #
# ========================================================================== #

if [ -d dist/ ]; then
cat >dist/package.json <<!EOF
{
  "main": "index.js",
  "type": "module"
}
!EOF
fi