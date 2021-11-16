jq -r '[.objects
    | .arsi_negele_shashemene
    | .[]?
    | [.[]?.properties
    | {
        "UNIT_ID": .W_CODE,
        "RK_CODE": .RK_CODE,
        "UNIT_TYPE": .UNIT_TYPE,
        "UNIT_NAME": .UNIT_NAME,
       }]
   | .[]?]
   | (.[0] | keys_unsorted) as $keys
    | $keys, map([.[ $keys[] ]])[]
   | @csv' ./ethiopia.topo.json > ../backend/source/wai-ethiopia/administration-ethiopia.csv

