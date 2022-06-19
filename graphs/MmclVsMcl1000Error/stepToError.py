import json
import numpy as np
import matplotlib.pyplot as plt


def analyze(table):
    res = [0] * (len(table[0]) - 1)
    for i in range(len(table)):
        # print(len(table[i]))
        for j in range(len(table[i]) - 1):
            res[j] += table[i][j + 1]
    return np.array(res)/len(table)


# Read file
file = open('data1000.json')
data100 = json.load(file)
file.close()

file = open('mine1000.json')
data1000 = json.load(file)
file.close()

table100 = data100['data']
table1000 = data1000['data']

xAxis = np.linspace(1, 24, num=24)
default100 = analyze(table100)
mine100 = analyze(table1000)

plt.figure()
plt.plot(xAxis, default100, 'b')
plt.plot(xAxis, mine100, 'r')
plt.xlabel('step size')
plt.ylabel('Error Percent')
# plt.title('')
plt.show()

# xAxis1 = xAxis
# order = default1000.argsort()
# default1000 = default1000[order]
# xAxis1 = xAxis1[order]
#
# xAxis2 = xAxis
# order1 = mine1000.argsort()
# mine1000 = mine1000[order]
# xAxis2 = xAxis2[order1]
#
#
# def what_is_x_when_y_is(input, x, y):
#     return x[y.searchsorted(input, 'left')]
#
#
# def interp_x_from_y(input, x, y):
#     return np.interp(input, y, x)
#
#
# # print(interp_x_from_y(5, xAxis, default1000))
# # print(interp_x_from_y(5, xAxis1, default1000))
# # print(interp_x_from_y(5, xAxis2, mine1000))
# print(default1000[0])
# print(mine1000[0])
