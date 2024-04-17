# ========================================================================== #
# Copyright (C) 2023 HCL America Inc.                                        #
# Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           #
# ========================================================================== #
cat >dist/cjs/package.json <<!EOF
{
    "type": "commonjs"
}
!EOF

cat >dist/esm/package.json <<!EOF
{
    "type": "module"
}
!EOF