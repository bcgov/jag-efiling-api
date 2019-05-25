#!/usr/bin/env sh

RUN_SONAR=${SONAR_TOKEN:-"NO"}

if [[ $RUN_SONAR = "NO" ]]; then
    echo "skipping sonar analysis"    
else
    sonar-scanner
fi
