import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn import svm, preprocessing, linear_model
from time import time

search_period_labels = {
    0: "0",
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "10",
    11: "11",
    12: "12",
    13: "13",
    14: "14",
    15: "15",
    16: "16",
    17: "17",
    18: "18",
    19: "19",
    20: "20",
    21: "21",
    22: "22",
    23: "23",
    24: "24",
    25: "25",
    26: "26",
    27: "27",
    28: "28",
    29: "29",
    30: "30",
    31: "31",
    32: "32",
    33: "33",
    34: "34",
    35: "35",
    36: "36",
    37: "37",
    38: "38",
    39: "39",
    40: "40",
    41: "41",
    42: "42",
    43: "43",
    44: "44",
    45: "45",
    46: "46",
    47: "47",
    48: "48",
    49: "49",
    50: "50",
    51: "51",
    52: "52",
    53: "53",
    54: "54",
    55: "55",
    56: "56",
    57: "57",
    58: "58",
    59: "59",
    60: "60",
    61: "61",
    62: "62",
    63: "63",
    64: "64",
    65: "65",
    66: "66",
    67: "67",
    68: "68",
    69: "69",
    70: "70",
    71: "71",
    72: "72",
    73: "73",
    74: "74",
    75: "75",
    76: "76",
    77: "77",
    78: "78",
    79: "79",
    80: "80",
    81: "81",
    82: "82",
    83: "83",
    84: "84",
    85: "85",
    86: "86",
    87: "87",
    88: "88",
    89: "89",
    90: "90",
    91: "91",
    92: "92",
    93: "93",
    94: "94",
    95: "95",
    96: "96",
    97: "97",
    98: "98",
    99: "99",
    100: "100",
    101: "101",
    102: "102",
    103: "103",
    104: "104",
    105: "105",
    106: "106",
    107: "107",
    108: "108",
    109: "109",
    110: "110",
    111: "111",
    112: "112",
    113: "113",
    114: "114",
    115: "115",
    116: "116",
    117: "117",
    118: "118",
    119: "119",
    120: "120",
    121: "121",
    122: "122",
    123: "123",
    124: "124",
    125: "125",
    126: "126",
    127: "127",
    128: "128",
    129: "129",
    130: "130",
    131: "131",
    132: "132",
    133: "133",
    134: "134",
    135: "135",
    136: "136",
    137: "137",
    138: "138",
    139: "139",
    140: "140",
    141: "141",
    142: "142",
    143: "143",
    144: "144",
    145: "145",
    146: "146",
    147: "147",
    148: "148",
    149: "149",
    150: "150",
    151: "151",
    152: "152",
    153: "153",
    154: "154",
    155: "155",
    156: "156",
    157: "157",
    158: "158",
    159: "159",
    160: "160",
    161: "161",
    162: "162",
    163: "163",
    164: "164",
    165: "165",
    166: "166",
    167: "167",
}

time_period_labels = {
    168: "168",
    169: "169",
    170: "170",
    171: "171",
    172: "172",
    173: "173",
    174: "174",
    175: "175",
    176: "176",
    177: "177",
    178: "178",
    179: "179",
    180: "180",
    181: "181",
    182: "182",
    183: "183",
    184: "184",
    185: "185",
    186: "186",
    187: "187",
    188: "188",
    189: "189",
    190: "190",
    191: "191",
    192: "192",
    193: "193",
    194: "194",
    195: "195",
    196: "196",
    197: "197",
    198: "198",
    199: "199",
    200: "200",
    201: "201",
    202: "202",
    203: "203",
    204: "204",
    205: "205",
    206: "206",
    207: "207",
    208: "208",
    209: "209",
    210: "210",
    211: "211",
    212: "212",
    213: "213",
    214: "214",
    215: "215",
    216: "216",
    217: "217",
    218: "218",
    219: "219",
    220: "220",
    221: "221",
    222: "222",
    223: "223",
    224: "224",
    225: "225",
    226: "226",
    227: "227",
    228: "228",
    229: "229",
    230: "230",
    231: "231",
    232: "232",
    233: "233",
    234: "234",
    235: "235",
    236: "236",
    237: "237",
    238: "238",
    239: "239",
    240: "240",
    241: "241",
    242: "242",
    243: "243",
    244: "244",
    245: "245",
    246: "246",
    247: "247",
    248: "248",
    249: "249",
    250: "250",
    251: "251",
    252: "252",
    253: "253",
    254: "254",
    255: "255",
    256: "256",
    257: "257",
    258: "258",
    259: "259",
    260: "260",
    261: "261",
    262: "262",
    263: "263",
    264: "264",
    265: "265",
    266: "266",
    267: "267",
    268: "268",
    269: "269",
    270: "270",
    271: "271",
    272: "272",
    273: "273",
    274: "274",
    275: "275",
    276: "276",
    277: "277",
    278: "278",
    279: "279",
    280: "280",
    281: "281",
    282: "282",
    283: "283",
    284: "284",
    285: "285",
    286: "286",
    287: "287",
    288: "288",
    289: "289",
    290: "290",
    291: "291",
    292: "292",
    293: "293",
    294: "294",
    295: "295",
    296: "296",
    297: "297",
    298: "298",
    299: "299",
    300: "300",
    301: "301",
    302: "302",
    303: "303",
    304: "304",
    305: "305",
    306: "306",
    307: "307",
    308: "308",
    309: "309",
    310: "310",
    311: "311",
    312: "312",
    313: "313",
    314: "314",
    315: "315",
    316: "316",
    317: "317",
    318: "318",
    319: "319",
    320: "320",
    321: "321",
    322: "322",
    323: "323",
    324: "324",
    325: "325",
    326: "326",
    327: "327",
    328: "328",
    329: "329",
    330: "330",
    331: "331",
    332: "332",
    333: "333",
    334: "334",
    335: "335",
}

raw_dataset = pd.read_csv("/Users/lucapalermo/Downloads/ML Dataset.csv")

raw_dataset = raw_dataset.dropna(how="any", axis=0)

# del raw_dataset['Search Period Type']
# del raw_dataset['Time Period Type']

dataset = raw_dataset.copy()

dataset["Search Period Type"] = dataset["Search Period Type"].map(
    {
        "VL": "Very Low",
        "L": "Low",
        "M": "Medium",
        "H": "High",
    }
)

dataset = pd.get_dummies(
    dataset, prefix="SPT", prefix_sep=" ", columns=["Search Period Type"]
)

dataset["Time Period Type"] = dataset["Time Period Type"].map(
    {
        "VL": "Very Low",
        "L": "Low",
        "M": "Medium",
        "H": "High",
    }
)

dataset = pd.get_dummies(
    dataset, prefix="TPT", prefix_sep=" ", columns=["Time Period Type"]
)

dataset["Search Period"] = dataset["Search Period"].map(search_period_labels)

dataset = pd.get_dummies(dataset, prefix='SP', prefix_sep=' ', columns=["Search Period"])

dataset["Time Period"] = dataset["Time Period"].map(time_period_labels)

dataset = pd.get_dummies(dataset, prefix="TP", prefix_sep=" ", columns=["Time Period"])

# dataset["Day of Week"] = dataset["Day of Week"].map(
#     {
#         0: "Sunday",
#         1: "Monday",
#         2: "Tuesday",
#         3: "Wednesday",
#         4: "Thursday",
#         5: "Friday",
#         6: "Saturday",
#     }
# )

# dataset = pd.get_dummies(dataset, prefix='', prefix_sep='')

# dataset["Hour"] = dataset["Hour"].map(
#     {
#         0: '12:00 AM',
#         1: '1:00 AM',
#         2: '2:00 AM',
#         3: '3:00 AM',
#         4: '4:00 AM',
#         5: '5:00 AM',
#         6: '6:00 AM',
#         7: '7:00 AM',
#         8: '8:00 AM',
#         9: '9:00 AM',
#         10: '10:00 AM',
#         11: '11:00 AM',
#         12: '12:00 PM',
#         13: '1:00 PM',
#         14: '2:00 PM',
#         15: '3:00 PM',
#         16: '4:00 PM',
#         17: '5:00 PM',
#         18: '6:00 PM',
#         19: '7:00 PM',
#         20: '8:00 PM',
#         21: '9:00 PM',
#         22: '10:00 PM',
#         23: '11:00 PM'
#     }
# )

# dataset = pd.get_dummies(dataset, prefix='', prefix_sep='')

train_dataset = dataset.sample(frac=0.8, random_state=0)
test_dataset = dataset.drop(train_dataset.index)

train_features = train_dataset.copy()
test_features = test_dataset.copy()

train_labels = train_features.pop("Bookings")
test_labels = test_features.pop("Bookings")

# sns.pairplot(train_dataset[['Searches', 'Reservations', 'Bookings', 'Time Period']], diag_kind='kde')
# plt.show()

# exit()

lasso = linear_model.Lasso()
# elasticnet = linear_model.ElasticNet()
# svr = svm.SVR(kernel="linear")
# ridge = linear_model.Ridge()
# regr = linear_model.LinearRegression()

start = time()
lasso.fit(train_features, train_labels)
# elasticnet.fit(train_features, train_labels)
# svr.fit(train_features, train_labels)
# ridge.fit(train_features, train_labels)
# regr.fit(train_features, train_labels)
end = time() - start
print('Training Time:', end)

test_results = {}

test_results["Lasso"] = lasso.score(test_features, test_labels)
# test_results["ElasticNet"] = elasticnet.score(test_features, test_labels)
# test_results["SVR"] = svr.score(test_features, test_labels)
# test_results["Ridge"] = ridge.score(test_features, test_labels)
# test_results["Regression"] = regr.score(test_features, test_labels)

print(pd.DataFrame(test_results, index=["R^2 coefficient"]).T)

lasso_predictions = lasso.predict(test_features)
# elasticnet_predictions = elasticnet.predict(test_features)
# svr_predictions = svr.predict(test_features)
# ridge_predictions = ridge.predict(test_features)
# regr_predictions = regr.predict(test_features)

raw_data = raw_dataset.to_numpy()

hours_predicted = list(test_features.axes[0])

plt.axes(aspect="equal")
plt.scatter(test_labels, lasso_predictions)
# plt.scatter(test_labels, elasticnet_predictions)
# plt.scatter(test_labels, svr_predictions)
# plt.scatter(test_labels, ridge_predictions)
# plt.scatter(test_labels, regr_predictions)
plt.xlabel("True Values")
plt.ylabel("Predictions")
plt.plot([0, 300], [0, 300])

# plt.show()

plt.axes(aspect=0.1)
plt.scatter(hours_predicted, lasso_predictions, c="red", label="Lasso Predictions")
# plt.scatter(
#     hours_predicted, elasticnet_predictions, c="orange", label="ElasticNet Predictions"
# )
# plt.scatter(hours_predicted, svr_predictions, c="blue", label="SVR Predictions")
# plt.scatter(hours_predicted, ridge_predictions, c="purple", label="Ridge Predictions")
# plt.scatter(
#     hours_predicted, regr_predictions, c="green", label="Regression Predictions"
# )
# plt.plot(
#     range(168, 336), dataset["Bookings"], label="Synthetic Values", c="#a1dab4"
# )
# plt.xlabel("Hour of Week")
# plt.ylabel("Bookings")
# plt.legend()
# plt.xlim(168, 336)
# plt.show()
