SCRIPT=$(realpath "$0")
SCRIPTPATH=$(dirname "$SCRIPT")

if [ "$#" -eq 0 ];then
    find "${SCRIPTPATH}/tmp" -type f -name "*.xlsx"
fi

if [ "$1" = "clear" ];then
    find "${SCRIPTPATH}/tmp" -type f -name "*.xlsx" -exec rm -f {} \;
fi
