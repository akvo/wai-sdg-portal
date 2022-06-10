#!/usr/bin/env bash

if [[ $# -eq 2 ]] ; then
    echo "$1 $2"
fi

if [[ $# -eq 3 ]] ; then
    python -m seeder.administration
    python -m seeder.admin "$@"
    # python -m seeder.fake_user 30 "$3"
    python -m seeder.form
    # python -m seeder.datapoint "$1"
else
    echo ""
    echo "This script require more than $# argument/s"
    echo ""
    echo "Example: ./test.sh dev@akvo.org \"My Name\" \"My Organisation\""
    echo ""
fi
