#!/bin/sh

set -e

function help() {
  echo "Usage:"
  echo "  generate [generator] [flags]"
  echo ""
  echo "Available Generators:"
  echo "  cray-service    generate resources and PRs for a service or API, including initial swagger codegen, helm charts, and CLI integration"
  echo "  cray-generator  generates a new, um, generator"
  echo ""
  echo "Flags:"
  echo "  --sections      Comma-delimited list to only run part or parts of a generator, options:"
  echo "                  kubernetes  = generate/update Kubernetes resources, Helm charts in your project"
  echo "                  service     = base codegen and other project bootstrapping resources such as DST Jenkins pipeline files"
  echo "                  cli         = automate integration with the CLI"
  echo "  --force         Will force overwrite, including the branch and PR created by the generator in your repo"
  echo ""
  echo "Examples:"
  echo "   Add a Helm chart to your service:"
  echo "      craypc generators generate cray-service --sections=kubernetes"
  echo ""
  echo "   Generate a new service:"
  echo "      craypc generators generate cray-service"
  echo ""
  echo "   Integrate with the CLI:"
  echo "      craypc generators generate cray-service --sections=cli"
  echo ""
}

for arg in "$@"; do
  if [[ "$arg" == "--help" ]] || [[ "$arg" == "help" ]] || [[ "$arg" == "-h" ]]; then
    help
    exit
  fi
done

if [[ "$1" != "generate" ]]; then
  help
  exit 1
fi
shift

yo --no-insight $@
