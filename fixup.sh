# ========================================================================== #
# Copyright (C) 2023, 2024 HCL America Inc.                                  #
# Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           #
# ========================================================================== #

if [ -d dist/cjs/ ]; then
cat >dist/cjs/package.json <<!EOF
{
  "type": "commonjs"
}
!EOF
fi

if [ -d dist/esm/ ]; then
cat >dist/esm/package.json <<!EOF
{
  "type": "module"
}
!EOF
fi