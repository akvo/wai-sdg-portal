#!/usr/bin/env bash

set -euo pipefail

yarn eslint src/
yarn prettier --check src/
