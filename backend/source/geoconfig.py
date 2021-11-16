import enum


class GeoLevels(enum.Enum):
    wai_ethiopia = [{
        "level": 0,
        "name": "UNIT_TYPE",
        "alias": "Woreda"
    }, {
        "level": 1,
        "name": "UNIT_NAME",
        "alias": "Kebele"
    }]
    wai_uganda = [{
        "level": 0,
        "name": "ADM1_EN",
        "alias": "Adm 01"
    }, {
        "level": 1,
        "name": "ADM2_EN",
        "alias": "Adm 02"
    }, {
        "level": 2,
        "name": "ADM4_EN",
        "alias": "Adm 03"
    }]
    wai_bangladesh = [{
        "level": 0,
        "name": "ADM1_EN",
        "alias": "Adm 01"
    }, {
        "level": 1,
        "name": "ADM2_EN",
        "alias": "Adm 02"
    }, {
        "level": 2,
        "name": "ADM3_EN",
        "alias": "Adm 03"
    }]


class GeoCenter(enum.Enum):
    wai_ethiopia = [38.6682, 7.3942]
    wai_uganda = [38.6682, 7.3942]
    wai_bangladesh = [38.6682, 7.3942]
