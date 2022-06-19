import json
import numpy as np
import copy
import matplotlib.pyplot as plt


def analyze(table):
    res = [0] * (len(table[0]) - 1)
    failCount = 0
    for i in range(len(table)):
        # print(len(table[i]))
        for j in range(len(table[i]) - 1):
            if(j == 10 and table[i][j + 1] >= 5):
                failCount += 1

            res[j] += table[i][j + 1]
    failCount = (failCount * 100) / len(table)
    print("error persentage:", failCount)
    return np.array(res)/len(table)


# Read file
file = open('data100.json')
data100 = json.load(file)
file.close()

file = open('mine100.json')
data1000 = json.load(file)
file.close()

table100 = data100['data']
table1000 = data1000['data']

xAxis = np.linspace(1, 24, num=24)
default100 = analyze(table100)
mine100 = analyze(table1000)

# print(len(xAxis))
# print(len(yAxis))
# plt.plot(xAxis, yAxis)
# plt.show()

plt.figure()
plt.plot(xAxis, default100, 'b')
plt.plot(xAxis, mine100, 'r')
plt.xlabel('step size')
plt.ylabel('Error Percent')
# plt.title('')
plt.show()

xAxis1 = copy.deepcopy(xAxis, memo=None, _nil=[])
order = default100.argsort()
default100 = default100[order]
xAxis1 = xAxis1[order]

xAxis2 = copy.deepcopy(xAxis, memo=None, _nil=[])
order1 = mine100.argsort()
mine100 = mine100[order1]
xAxis2 = xAxis2[order1]


def what_is_x_when_y_is(input, x, y):
    return x[y.searchsorted(input, 'left')]


def interp_x_from_y(input, x, y):
    return np.interp(input, y, x)


# print(interp_x_from_y(5, xAxis, default1000))
# print(interp_x_from_y(5, xAxis1, default100))
# print(interp_x_from_y(5, xAxis2, mine100))
print(mine100[0])
print(default100[0])
