import enum


class GeoLevels(enum.Enum):
    notset = [{
        "level": 0,
        "name": "provinsi",
        "alias": "Provinsi"
    }, {
        "level": 1,
        "name": "kabkot",
        "alias": "Kabupaten / Kota"
    }]
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
        "name": "ADM2_EN",
        "alias": "District"
    }, {
        "level": 1,
        "name": "ADM4_EN",
        "alias": "Sub-County"
    }]
    wai_bangladesh = [{
        "level": 0,
        "name": "ADM2_EN",
        "alias": "District"
    }, {
        "level": 2,
        "name": "ADM4_EN",
        "alias": "Municipality"
    }, {
        "level": 3,
        "name": "WARD",
        "alias": "Ward"
    }]


class GeoCenter(enum.Enum):
    notset = [106.3715, -8.849025]
    wai_ethiopia = [38.6682, 7.3942]
    wai_uganda = [33.3486, 2.9251]
    wai_bangladesh = [88.9238, 22.0201]
