#!/bin/bash
echo "This script assumes:"
echo "- you are running it in e-filing projet"
echo "- a postgresql application already exists in the projects corresponding secret"

oc process -f "./api-assuming-database-exists.json" "" | oc create -f -
