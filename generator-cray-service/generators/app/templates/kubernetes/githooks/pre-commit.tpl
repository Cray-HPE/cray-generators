#!/bin/sh

# This commit is intended to automate incrementing your Helm chart version whenever you increment your app/service version
# It's required that the chart version be bumped whenever you do so with your app/service version, which can lead to confusion or forgetting to do so
# So, providing a git hook to automate and reduce the possibility of this being a point of confusion and breaking master builds
# See https://connect.us.cray.com/jira/browse/CASMCLOUD-615 for more info

if git diff-index --name-only HEAD | grep ^.version &>/dev/null; then
  chart_path=$(find ./kubernetes -name Chart.yaml | head -1)
  removed_version=$(git diff --cached $chart_path | grep '^-version')
  removed_version_number="${removed_version##*:}"
  added_version=$(git diff --cached $chart_path | grep '^+version')
  added_version_number="${added_version##*:}"
  if [[ -z "$added_version" ]] || [[ "$added_version_number" == "$removed_version_number" ]]; then
    echo "Automatically incrementing your Helm chart version since you changed your app/service version"
    chart_version=$(cat $chart_path | grep ^version:)
    version_less_patch="${chart_version%.*}"
    patch_number="${chart_version##*.}"
    new_version="$version_less_patch.$((patch_number+1))"
    sed -i.bak 's|^version:.*|'"$new_version"'|g' $chart_path
    rm $chart_path.bak &>/dev/null
    git add $chart_path
  fi
fi
