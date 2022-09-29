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
    wai_demo = [{
        "level": 0,
        "name": "UNIT_TYPE",
        "alias": "Woreda"
    }, {
        "level": 1,
        "name": "UNIT_NAME",
        "alias": "Kebele"
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
        "level": 1,
        "name": "ADM4_EN",
        "alias": "Union / Municipality"
    }]
    wai_nepal = [{
        "level": 0,
        "name": "DISTRICT",
        "alias": "District"
    }, {
        "level": 1,
        "name": "UNIT_NAME",
        "alias": "Municipality"
    }]


# Landing Page
class GeoCenter(enum.Enum):
    notset = [106.3715, -8.84902]
    wai_demo = [38.6682, 7.3942]
    wai_ethiopia = [38.6682, 7.3942]
    wai_uganda = [33.3486, 2.9251]
    wai_bangladesh = [89.02973, 22.75877]
    wai_nepal = [81.73551085, 28.42744314]
