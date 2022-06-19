import json
import numpy as np
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
file = open('data1000.json')
default1000 = json.load(file)
file.close()

file = open('mine1000.json')
mine1000 = json.load(file)
file.close()

default1000 = default1000['data']
mine1000 = mine1000['data']

xAxis = np.linspace(1, 24, num=24)
default1000 = analyze(default1000)
mine1000 = analyze(mine1000)

# print(len(xAxis))
# print(len(yAxis))
# plt.plot(xAxis, yAxis)
# plt.show()

plt.figure()
plt.plot(xAxis, default1000, 'b')
plt.plot(xAxis, mine1000, 'r')
# plt.plot(xAxis, mine1000_2, 'g')
plt.xlabel('step size')
plt.ylabel('Error Percent')
# plt.title('')
plt.show()


xAxis1 = xAxis
order = default1000.argsort()
default1000 = default1000[order]
xAxis1 = xAxis1[order]

xAxis2 = xAxis
order1 = mine1000.argsort()
mine1000 = mine1000[order]
xAxis2 = xAxis2[order1]


def what_is_x_when_y_is(input, x, y):
    return x[y.searchsorted(input, 'left')]


def interp_x_from_y(input, x, y):
    return np.interp(input, y, x)


# print(interp_x_from_y(5, xAxis, default1000))
# print(interp_x_from_y(5, xAxis1, default1000))
# print(interp_x_from_y(5, xAxis2, mine1000))
print(default1000[0])
print(mine1000[0])
